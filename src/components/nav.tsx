"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/tasks", label: "Tasks" },
  { href: "/history", label: "History" },
  { href: "/search", label: "Search" },
];

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-stone-900">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white text-sm">
            ⌂
          </span>
          <span>Koti</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden sm:flex items-center gap-0.5">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-800 font-medium"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
