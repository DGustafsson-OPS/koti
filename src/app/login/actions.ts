"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { getDictionary} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export async function loginFormAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!verifyCredentials(username, password)) {
    return { error: dict.auth.invalidCredentials };
  }

  await createSession();
  redirect(from.startsWith("/") && !from.startsWith("//") ? from : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
