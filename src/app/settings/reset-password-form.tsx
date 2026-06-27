"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function ResetPasswordForm({
  userId,
  resetAction,
  defaultOpen = false,
}: {
  userId: string;
  resetAction: (formData: FormData) => Promise<void>;
  defaultOpen?: boolean;
}) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(defaultOpen);

  if (!open && !defaultOpen) {
    return (
      <Button type="button" variant="ghost" className="text-xs" onClick={() => setOpen(true)}>
        {dict.settings.resetPassword}
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await resetAction(formData);
        setOpen(false);
      }}
      className="flex flex-col sm:flex-row gap-2 items-end"
    >
      <input type="hidden" name="userId" value={userId} />
      <Input
        label={dict.settings.newPassword}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder={dict.settings.passwordPlaceholder}
      />
      <div className="flex gap-2 shrink-0">
        <Button type="submit" variant="secondary" className="text-xs">
          {dict.common.save}
        </Button>
        <Button type="button" variant="ghost" className="text-xs" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
