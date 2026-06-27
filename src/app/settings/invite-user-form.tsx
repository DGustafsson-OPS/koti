"use client";

import { Button, Input, Select } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function InviteUserForm({
  inviteAction,
}: {
  inviteAction: (formData: FormData) => Promise<void>;
}) {
  const { dict } = useI18n();

  return (
    <form action={inviteAction} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end mb-6 pb-6 border-b border-stone-100">
      <Input
        label={dict.settings.inviteEmail}
        name="email"
        type="email"
        required
        placeholder={dict.settings.inviteEmailPlaceholder}
      />
      <Input
        label={dict.settings.inviteName}
        name="name"
        placeholder={dict.settings.inviteNamePlaceholder}
      />
      <Select label={dict.settings.inviteRole} name="role" defaultValue="member">
        <option value="member">{dict.settings.roleMember}</option>
        <option value="admin">{dict.settings.roleAdmin}</option>
      </Select>
      <Button type="submit" variant="secondary">
        {dict.settings.inviteSubmit}
      </Button>
    </form>
  );
}
