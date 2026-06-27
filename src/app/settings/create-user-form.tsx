"use client";

import { Button, Input, Select } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function CreateUserForm({
  createAction,
}: {
  createAction: (formData: FormData) => Promise<void>;
}) {
  const { dict } = useI18n();

  return (
    <form action={createAction} className="grid sm:grid-cols-2 gap-3 items-end mb-6 pb-6 border-b border-stone-100">
      <Input
        label={dict.settings.username}
        name="username"
        required
        autoComplete="off"
        placeholder={dict.settings.usernamePlaceholder}
      />
      <Input
        label={dict.settings.displayName}
        name="name"
        placeholder={dict.settings.displayNamePlaceholder}
      />
      <Input
        label={dict.settings.password}
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder={dict.settings.passwordPlaceholder}
      />
      <Select label={dict.settings.inviteRole} name="role" defaultValue="member">
        <option value="member">{dict.settings.roleMember}</option>
        <option value="admin">{dict.settings.roleAdmin}</option>
      </Select>
      <div className="sm:col-span-2">
        <Button type="submit" variant="secondary">
          {dict.settings.createUserSubmit}
        </Button>
      </div>
    </form>
  );
}
