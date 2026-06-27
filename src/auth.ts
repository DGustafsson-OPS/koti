import NextAuth from "next-auth";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { upsertCredentialsUser, upsertOAuthUser } from "@/lib/users";
import { getAppleClientSecret } from "@/lib/apple-client-secret";

function verifyCredentials(username: string, password: string) {
  const expectedUser = process.env.AUTH_USERNAME ?? "admin";
  const expectedPassword = process.env.AUTH_PASSWORD;
  if (!expectedPassword) return false;
  return username === expectedUser && password === expectedPassword;
}

const appleConfigured =
  process.env.AUTH_APPLE_ID &&
  process.env.AUTH_APPLE_TEAM_ID &&
  process.env.AUTH_APPLE_KEY_ID &&
  process.env.AUTH_APPLE_PRIVATE_KEY;

const appleSecret = appleConfigured ? await getAppleClientSecret() : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(appleSecret && process.env.AUTH_APPLE_ID
      ? [
          Apple({
            clientId: process.env.AUTH_APPLE_ID,
            clientSecret: appleSecret,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!verifyCredentials(username, password)) return null;

        const user = await upsertCredentialsUser(username);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "apple") {
        const dbUser = await upsertOAuthUser({
          provider: "apple",
          providerAccountId: account.providerAccountId,
          email: user.email ?? (profile as { email?: string | null })?.email,
          name: user.name,
          image: user.image,
        });
        user.id = dbUser.id;
        (user as { role?: string }).role = dbUser.role;
      }
      return true;
    },
  },
});
