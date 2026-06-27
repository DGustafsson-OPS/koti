import { auth } from "@/auth";
import { getUsers } from "@/lib/users";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { Panel, Badge } from "@/components/ui";
import { UserRoleForm } from "./user-role-form";
import { updateUserRole } from "@/lib/users";

export async function UsersSettings() {
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const users = await getUsers();
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

        {users.length === 0 ? (
          <p className="text-sm text-stone-500">{dict.settings.noUsers}</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-stone-900">{user.name ?? user.email ?? user.id}</p>
                  {user.email && user.name && (
                    <p className="text-xs text-stone-500">{user.email}</p>
                  )}
                </div>
                {isAdmin ? (
                  <UserRoleForm userId={user.id} role={user.role} setRoleAction={setRole} />
                ) : (
                  <Badge variant={user.role === "admin" ? "blue" : "default"}>
                    {user.role === "admin" ? dict.settings.roleAdmin : dict.settings.roleMember}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
