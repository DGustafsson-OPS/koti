"use client";

import { useI18n } from "@/components/locale-provider";

export function UserRoleForm({
  userId,
  role,
  setRoleAction,
}: {
  userId: string;
  role: string;
  setRoleAction: (formData: FormData) => Promise<void>;
}) {
  const { dict } = useI18n();

  return (
    <form action={setRoleAction}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        className="text-xs border border-stone-200 rounded-lg px-2 py-1"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="admin">{dict.settings.roleAdmin}</option>
        <option value="member">{dict.settings.roleMember}</option>
      </select>
    </form>
  );
}
