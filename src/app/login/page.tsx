import { Home } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_55%)]" />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-display text-xl font-semibold">Koti</span>
          </div>
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">
              A permanent memory for your home
            </h2>
            <p className="text-brand-100/80 mt-4 text-lg leading-relaxed max-w-md">
              Every room, repair, material, warranty, and task — connected and searchable.
            </p>
          </div>
          <p className="text-brand-200/60 text-sm">koti.tervakuja.fi</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-canvas">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-700 text-white mb-4 shadow-lg shadow-brand-900/20">
              <Home className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-stone-900">Sign in to Koti</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="font-display text-2xl font-semibold text-stone-900">Welcome back</h1>
            <p className="text-stone-500 mt-2 text-sm">Sign in to access your home memory.</p>
          </div>

          <div className="bg-surface border border-stone-200/80 rounded-2xl p-6 shadow-sm">
            <LoginForm from={from ?? "/"} />
          </div>
        </div>
      </div>
    </div>
  );
}
