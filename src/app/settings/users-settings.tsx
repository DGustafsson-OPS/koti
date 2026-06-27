import { auth } from "@/auth";
import { getUsers, getUserAccountStatus, inviteUser, removePendingUser, updateUserRole } from "@/lib/users";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { Panel, Badge, Button } from "@/components/ui";
import { UserRoleForm } from "./user-role-form";
import { InviteUserForm } from "./invite-user-form";

export async function UsersSettings() {
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const users = await getUsers();
  const accountStatus = await getUserAccountStatus(users.map((u) => u.id));
  const currentUser = users.find((u) => u.id === session?.user?.id);
  const isAdmin = session?.user?.role === "admin";

  async function setRole(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== "admin") return;

    const userId = formData.get("userId") as string;
    const role = formData.get("role") as "admin" | "member";
    await updateUserRole(userId, role);
  }

  async function handleInvite(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== "admin") return;

    await inviteUser({
      email: formData.get("email") as string,
      name: (formData.get("name") as string) || undefined,
      role: (formData.get("role") as "admin" | "member") || "member",
    });
  }

  async function handleRemoveInvite(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== "admin") return;

    const userId = formData.get("userId") as string;
    if (userId === session.user?.id) return;

    await removePendingUser(userId);
  }

  return (
    <div className="space-y-6 mt-8">
      <Panel title={dict.settings.users}>
        <p className="text-sm text-stone-500 mb-4">{dict.settings.usersHelp}</p>

        {currentUser && (
          <p className="text-sm text-stone-700 mb-4">
            {dict.settings.signedInAs}{" "}
            <span className="font-medium">{currentUser.name ?? currentUser.email}</span>
          </p>
        )}

        {isAdmin && <InviteUserForm inviteAction={handleInvite} />}

        {users.length === 0 ? (
          <p className="text-sm text-stone-500">{dict.settings.noUsers}</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => {
              const hasAccount = accountStatus.get(user.id) ?? false;
              const isPending = !hasAccount;

              return (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-stone-900">{user.name ?? user.email ?? user.id}</p>
                      {isPending && (
                        <Badge variant="default">{dict.settings.pendingInvite}</Badge>
                      )}
                    </div>
                    {user.email && user.name && (
                      <p className="text-xs text-stone-500">{user.email}</p>
                    )}
                    {isPending && (
                      <p className="text-xs text-stone-400 mt-0.5">{dict.settings.pendingInviteHelp}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin ? (
                      <UserRoleForm userId={user.id} role={user.role} setRoleAction={setRole} />
                    ) : (
                      <Badge variant={user.role === "admin" ? "blue" : "default"}>
                        {user.role === "admin" ? dict.settings.roleAdmin : dict.settings.roleMember}
                      </Badge>
                    )}
                    {isAdmin && isPending && user.id !== session?.user?.id && (
                      <form action={handleRemoveInvite}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Button type="submit" variant="ghost" className="text-xs text-red-600">
                          {dict.common.delete}
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
