"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Home,
  CheckSquare,
  History,
  Search,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/types";

type NavLabels = Dictionary["nav"];

function buildLinks(labels: NavLabels) {
  return [
    { href: "/", label: labels.dashboard, icon: LayoutDashboard },
    { href: "/properties", label: labels.properties, icon: Home },
    { href: "/tasks", label: labels.tasks, icon: CheckSquare },
    { href: "/history", label: labels.history, icon: History },
    { href: "/search", label: labels.search, icon: Search },
    { href: "/settings", label: labels.settings, icon: Settings },
  ];
}

function NavLink({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-white/15 text-white shadow-sm"
          : "text-brand-100/80 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="w-[18px] h-[18px] shrink-0 opacity-90" />
      {label}
    </Link>
  );
}

function SidebarContent({
  labels,
  onNavigate,
}: {
  labels: NavLabels;
  onNavigate?: () => void;
}) {
  const links = buildLinks(labels);

  return (
    <>
      <div className="px-4 py-6 border-b border-white/10">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 text-white ring-1 ring-white/20 group-hover:bg-white/20 transition-colors">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white tracking-tight">Koti</p>
            <p className="text-[11px] text-brand-200/70 uppercase tracking-widest">{labels.tagline}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {links.map((l) => (
          <NavLink key={l.href} {...l} onClick={onNavigate} />
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-100/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {labels.signOut}
          </button>
        </form>
      </div>
    </>
  );
}

export function AppShell({
  children,
  labels,
}: {
  children: React.ReactNode;
  labels: NavLabels;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 flex-col bg-brand-900 shrink-0 sticky top-0 h-screen">
        <SidebarContent labels={labels} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col bg-brand-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-brand-100 hover:text-white"
              aria-label={labels.closeMenu}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent labels={labels} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-surface/90 backdrop-blur-md border-b border-stone-200/80">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            aria-label={labels.openMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="font-display font-semibold text-brand-800">
            Koti
          </Link>
          <div className="w-9" />
        </header>

        <main className="flex-1 app-canvas">{children}</main>
      </div>
    </div>
  );
}
