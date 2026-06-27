"use client";

import { useActionState } from "react";
import { loginFormAction } from "./actions";
import { Button, Input } from "@/components/ui";

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(loginFormAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      <Input
        label="Username"
        name="username"
        autoComplete="username"
        required
        placeholder="admin"
      />
      <Input
        label="Password"
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
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
