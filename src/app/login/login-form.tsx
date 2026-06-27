"use client";

import { useActionState } from "react";
import { loginFormAction } from "./actions";
import { Button, Input } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function LoginForm({ from }: { from: string }) {
  const { dict } = useI18n();
  const [state, action, pending] = useActionState(loginFormAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      <Input
        label={dict.auth.username}
        name="username"
        autoComplete="username"
        required
        placeholder={dict.auth.usernamePlaceholder}
      />
      <Input
        label={dict.auth.password}
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full justify-center" disabled={pending}>
        {pending ? dict.common.signingIn : dict.common.signIn}
      </Button>
    </form>
  );
}
