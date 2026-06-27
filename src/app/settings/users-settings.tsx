import { auth } from "@/auth";
import {
  getUsers,
  getUserAuthMethods,
  inviteUser,
  removePendingUser,
  updateUserRole,
  createCredentialsUser,
  setCredentialsPassword,
  deleteUser,
} from "@/lib/users";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { Panel, Badge, Button } from "@/components/ui";
import { UserRoleForm } from "./user-role-form";
import { InviteUserForm } from "./invite-user-form";
import { CreateUserForm } from "./create-user-form";
import { ResetPasswordForm } from "./reset-password-form";

export async function UsersSettings() {
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const users = await getUsers();
  const authMethods = await getUserAuthMethods(users.map((u) => u.id));
  const currentUser = users.find((u) => u.id === session?.user?.id);
  const isAdmin = session?.user?.role === "admin";
  const currentAuth = session?.user?.id ? authMethods.get(session.user.id) : undefined;
  const hasPasswordLogin = currentAuth?.providers.includes("credentials") ?? false;

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

  async function handleCreateUser(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== "admin") return;

    await createCredentialsUser({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      name: (formData.get("name") as string) || undefined,
      role: (formData.get("role") as "admin" | "member") || "member",
    });
  }

  async function handleResetPassword(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const userId = formData.get("userId") as string;
    const password = formData.get("password") as string;
    const isAdmin = session.user.role === "admin";
    const isSelf = userId === session.user.id;

    if (!isSelf && !isAdmin) return;

    await setCredentialsPassword(userId, password);
  }

  async function handleRemoveInvite(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== "admin") return;

    const userId = formData.get("userId") as string;
    if (userId === session.user?.id) return;

    await removePendingUser(userId);
  }

  async function handleDeleteUser(formData: FormData) {
    "use server";
    const session = await auth();
    if (session?.user?.role !== "admin" || !session.user.id) return;

    const userId = formData.get("userId") as string;
    await deleteUser(userId, session.user.id);
  }

  return (
    <div className="space-y-6 mt-8">
      {hasPasswordLogin && session?.user?.id && (
        <Panel title={dict.settings.changePassword}>
          <p className="text-sm text-stone-500 mb-4">{dict.settings.changePasswordHelp}</p>
          <ResetPasswordForm
            userId={session.user.id}
            resetAction={handleResetPassword}
            defaultOpen
          />
        </Panel>
      )}

      <Panel title={dict.settings.users}>
        <p className="text-sm text-stone-500 mb-4">{dict.settings.usersHelp}</p>

        {currentUser && (
          <p className="text-sm text-stone-700 mb-4">
            {dict.settings.signedInAs}{" "}
            <span className="font-medium">{currentUser.name ?? currentUser.email}</span>
          </p>
        )}

        {isAdmin && (
          <>
            <h3 className="text-sm font-medium text-stone-800 mb-3">{dict.settings.createUserTitle}</h3>
            <CreateUserForm createAction={handleCreateUser} />

            <h3 className="text-sm font-medium text-stone-800 mb-3">{dict.settings.inviteTitle}</h3>
            <InviteUserForm inviteAction={handleInvite} />
          </>
        )}

        {users.length === 0 ? (
          <p className="text-sm text-stone-500">{dict.settings.noUsers}</p>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => {
              const auth = authMethods.get(user.id) ?? { providers: [] };
              const hasAccount = auth.providers.length > 0;
              const isPending = !hasAccount;
              const hasCredentials = auth.providers.includes("credentials");
              const hasApple = auth.providers.includes("apple");

              return (
                <li
                  key={user.id}
                  className="py-3 border-b border-stone-100 last:border-0 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-stone-900">{user.name ?? user.email ?? user.id}</p>
                        {hasCredentials && (
                          <Badge variant="blue">{dict.settings.authMethodPassword}</Badge>
                        )}
                        {hasApple && (
                          <Badge variant="default">{dict.settings.authMethodApple}</Badge>
                        )}
                        {isPending && (
                          <Badge variant="default">{dict.settings.pendingInvite}</Badge>
                        )}
                      </div>
                      {hasCredentials && auth.username && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          {dict.settings.username}: {auth.username}
                        </p>
                      )}
                      {user.email && !user.email.endsWith("@local.koti") && (
                        <p className="text-xs text-stone-500">{user.email}</p>
                      )}
                      {isPending && (
                        <p className="text-xs text-stone-400 mt-0.5">{dict.settings.pendingInviteHelp}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {isAdmin ? (
                        <UserRoleForm userId={user.id} role={user.role} setRoleAction={setRole} />
                      ) : (
                        <Badge variant={user.role === "admin" ? "blue" : "default"}>
                          {user.role === "admin" ? dict.settings.roleAdmin : dict.settings.roleMember}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isAdmin && hasCredentials && user.id !== session?.user?.id && (
                    <ResetPasswordForm userId={user.id} resetAction={handleResetPassword} />
                  )}

                  {isAdmin && user.id !== session?.user?.id && (
                    <div className="flex gap-2">
                      {isPending && (
                        <form action={handleRemoveInvite}>
                          <input type="hidden" name="userId" value={user.id} />
                          <Button type="submit" variant="ghost" className="text-xs text-red-600">
                            {dict.common.delete}
                          </Button>
                        </form>
                      )}
                      {hasAccount && (
                        <form action={handleDeleteUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <Button type="submit" variant="ghost" className="text-xs text-red-600">
                            {dict.settings.removeUser}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
