"use server";

import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { now } from "@/lib/utils";
import { v4 as uuid } from "uuid";

export async function getUsers() {
  return db.select().from(users).orderBy(asc(users.name), asc(users.email));
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
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
        email: data.email ?? existingAccount.user.email,
        name: data.name ?? existingAccount.user.name,
        image: data.image ?? existingAccount.user.image,
        updatedAt: ts,
      })
      .where(eq(users.id, existingAccount.user.id));
    return existingAccount.user;
  }

  const userId = uuid();
  const userCount = await db.select().from(users);
  const role = userCount.length === 0 ? "admin" : "member";

  await db.insert(users).values({
    id: userId,
    email: data.email ?? null,
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
}
