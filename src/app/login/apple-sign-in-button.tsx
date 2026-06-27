"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function AppleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  const { dict } = useI18n();

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full justify-center"
      onClick={() => signIn("apple", { callbackUrl })}
    >
      {dict.settings.signInWithApple}
    </Button>
  );
}
