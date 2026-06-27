"use server";

import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import { now } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { revalidatePath } from "next/cache";

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalized));
  return user ?? null;
}

async function userHasAccount(userId: string) {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);
  return !!account;
}

export async function inviteUser(data: {
  email: string;
  name?: string;
  role?: "admin" | "member";
}) {
  const email = data.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Invalid email");

  const existing = await getUserByEmail(email);
  if (existing) {
    if (await userHasAccount(existing.id)) {
      throw new Error("User already signed in");
    }
    await db
      .update(users)
      .set({
        name: data.name?.trim() || existing.name,
        role: data.role ?? existing.role,
        updatedAt: now(),
      })
      .where(eq(users.id, existing.id));
    revalidatePath("/settings");
    return existing.id;
  }

  const userId = uuid();
  const ts = now();
  await db.insert(users).values({
    id: userId,
    email,
    name: data.name?.trim() || email.split("@")[0],
    image: null,
    role: data.role ?? "member",
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath("/settings");
  return userId;
}

export async function removePendingUser(userId: string) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  if (await userHasAccount(userId)) throw new Error("Cannot remove active user");
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/settings");
}

export async function getUsers() {
  return db.select().from(users).orderBy(asc(users.name), asc(users.email));
}

export async function getUserAccountStatus(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, boolean>();
  const rows = await db
    .select({ userId: accounts.userId })
    .from(accounts)
    .where(inArray(accounts.userId, userIds));
  const active = new Set(rows.map((r) => r.userId));
  return new Map(userIds.map((id) => [id, active.has(id)]));
}

export async function upsertOAuthUser(data: {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}) {
  const [existingAccount] = await db
    .select({ user: users })
    .from(accounts)
    .innerJoin(users, eq(accounts.userId, users.id))
    .where(
      and(
        eq(accounts.provider, data.provider),
        eq(accounts.providerAccountId, data.providerAccountId)
      )
    );

  const ts = now();

  if (existingAccount) {
    await db
      .update(users)
      .set({
        email: data.email?.trim().toLowerCase() ?? existingAccount.user.email,
        name: data.name ?? existingAccount.user.name,
        image: data.image ?? existingAccount.user.image,
        updatedAt: ts,
      })
      .where(eq(users.id, existingAccount.user.id));
    return existingAccount.user;
  }

  if (data.email) {
    const invited = await getUserByEmail(data.email);
    if (invited) {
      await db.insert(accounts).values({
        id: uuid(),
        userId: invited.id,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        createdAt: ts,
      });
      await db
        .update(users)
        .set({
          name: data.name ?? invited.name,
          image: data.image ?? invited.image,
          updatedAt: ts,
        })
        .where(eq(users.id, invited.id));
      return invited;
    }
  }

  const userId = uuid();
  const userCount = await db.select().from(users);
  const role = userCount.length === 0 ? "admin" : "member";

  await db.insert(users).values({
    id: userId,
    email: data.email?.trim().toLowerCase() ?? null,
    name: data.name ?? data.email ?? "Apple user",
    image: data.image ?? null,
    role,
    createdAt: ts,
    updatedAt: ts,
  });

  await db.insert(accounts).values({
    id: uuid(),
    userId,
    provider: data.provider,
    providerAccountId: data.providerAccountId,
    createdAt: ts,
  });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user!;
}

export async function upsertCredentialsUser(username: string) {
  const provider = "credentials";
  const providerAccountId = username;
  const email = `${username}@local.koti`;

  const [existingAccount] = await db
    .select({ user: users })
    .from(accounts)
    .innerJoin(users, eq(accounts.userId, users.id))
    .where(and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)));

  if (existingAccount) return existingAccount.user;

  const ts = now();
  const userId = uuid();
  const userCount = await db.select().from(users);
  const isBootstrapAdmin = userCount.length === 0 || username === (process.env.AUTH_USERNAME ?? "admin");

  await db.insert(users).values({
    id: userId,
    email,
    name: username,
    image: null,
    role: isBootstrapAdmin ? "admin" : "member",
    createdAt: ts,
    updatedAt: ts,
  });

  await db.insert(accounts).values({
    id: uuid(),
    userId,
    provider,
    providerAccountId,
    createdAt: ts,
  });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user!;
}

export async function updateUserRole(userId: string, role: "admin" | "member") {
  await db.update(users).set({ role, updatedAt: now() }).where(eq(users.id, userId));
  revalidatePath("/settings");
}
