"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";

export async function loginFormAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!verifyCredentials(username, password)) {
    return { error: "Invalid username or password" };
  }

  await createSession();
  redirect(from.startsWith("/") && !from.startsWith("//") ? from : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
