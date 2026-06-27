import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession() {
  const token = await new SignJWT({ sub: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set("koti-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("koti-session");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("koti-session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export function verifyCredentials(username: string, password: string) {
  const expectedUser = process.env.AUTH_USERNAME ?? "admin";
  const expectedPassword = process.env.AUTH_PASSWORD;
  if (!expectedPassword) return false;
  return username === expectedUser && password === expectedPassword;
}

export function getAuthSecretKey() {
  return getSecret();
}
