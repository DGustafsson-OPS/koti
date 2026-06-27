import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/tasks", label: "Tasks" },
  { href: "/history", label: "History" },
  { href: "/search", label: "Search" },
];

export function Nav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand-700">
          <span className="text-xl">🏠</span>
          <span>Koti</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
