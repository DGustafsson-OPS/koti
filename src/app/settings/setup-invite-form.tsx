"use client";

import { Button, Input } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function SetupInviteForm({
  userId,
  defaultUsername,
  setupAction,
}: {
  userId: string;
  defaultUsername: string;
  setupAction: (formData: FormData) => Promise<void>;
}) {
  const { dict } = useI18n();

  return (
    <form
      action={setupAction}
      className="flex flex-col sm:flex-row gap-2 items-end pt-1"
    >
      <input type="hidden" name="userId" value={userId} />
      <Input
        label={dict.settings.username}
        name="username"
        required
        autoComplete="off"
        defaultValue={defaultUsername}
        placeholder={dict.settings.usernamePlaceholder}
      />
      <Input
        label={dict.settings.password}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder={dict.settings.passwordPlaceholder}
      />
      <div className="shrink-0">
        <Button type="submit" variant="secondary" className="text-xs">
          {dict.settings.setupPasswordSubmit}
        </Button>
      </div>
    </form>
  );
}
