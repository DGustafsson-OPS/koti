"use server";

import { connectKotiakku, disconnectKotiakku } from "@/lib/queries";
import { KotiakkuApiError } from "@/lib/kotiakku";
import { auth } from "@/auth";

export async function connectKotiakkuAction(propertyId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const apiKey = String(formData.get("apiKey") ?? "").trim();
  if (!apiKey) {
    return { error: "missing_key" as const };
  }

  try {
    await connectKotiakku(propertyId, apiKey);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof KotiakkuApiError && (error.status === 401 || error.status === 403)) {
      return { error: "invalid_key" as const };
    }
    if (error instanceof KotiakkuApiError && error.status === 429) {
      return { error: "rate_limit" as const };
    }
    throw error;
  }
}

export async function disconnectKotiakkuAction(propertyId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await disconnectKotiakku(propertyId);
}
