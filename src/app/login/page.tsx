import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-stone-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white text-2xl mb-4 shadow-lg shadow-brand-600/20">
            ⌂
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Sign in to Koti</h1>
          <p className="text-stone-500 mt-2 text-sm">
            Your home&apos;s digital memory — rooms, tasks, and history in one place.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <LoginForm from={from ?? "/"} />
        </div>
      </div>
    </div>
  );
}
