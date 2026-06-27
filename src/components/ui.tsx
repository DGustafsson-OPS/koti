import Link from "next/link";
import { cn } from "@/lib/utils";
import { queryUrl } from "@/lib/query-url";

export function PageContainer({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  const widths = {
    narrow: "max-w-2xl",
    default: "max-w-6xl",
    wide: "max-w-none",
  };

  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 xl:px-10 py-8 lg:py-10", widths[size], className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="inline-flex items-center text-sm text-stone-500 hover:text-brand-700 mb-3 transition-colors"
        >
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-stone-500 mt-2 text-base leading-relaxed">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function Card({
  children,
  className,
  href,
  padding = "default",
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  padding?: "none" | "sm" | "default";
}) {
  const paddingClass = {
    none: "",
    sm: "p-4",
    default: "p-5",
  }[padding];

  const cls = cn(
    "bg-surface border border-stone-200/80 rounded-2xl shadow-sm shadow-stone-200/40",
    href && "hover:border-brand-300 hover:shadow-md hover:shadow-brand-100/50 transition-all duration-200 block",
    paddingClass,
    className
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "green" | "red" | "yellow" | "blue";
}) {
  const colors = {
    default: "bg-stone-100 text-stone-600 ring-stone-200/60",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    red: "bg-red-50 text-red-700 ring-red-200/60",
    yellow: "bg-amber-50 text-amber-800 ring-amber-200/60",
    blue: "bg-sky-50 text-sky-800 ring-sky-200/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset",
        colors[variant]
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "default",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm";
}) {
  const variants = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-sm shadow-brand-900/10",
    secondary: "bg-surface border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300",
    ghost: "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    default: "px-4 py-2.5 text-sm",
    sm: "px-3 py-1.5 text-xs",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const variants = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-sm shadow-brand-900/10",
    secondary: "bg-surface border border-stone-200 text-stone-700 hover:bg-stone-50",
  };
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-surface border border-stone-200/80 rounded-2xl p-5 shadow-sm", className)}>
      {title && <h3 className="text-sm font-semibold text-stone-800 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

export function EmptyState({
  message,
  action,
  icon,
}: {
  message: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6">
      {icon && (
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mb-4">
          {icon}
        </div>
      )}
      <p className="text-stone-500 max-w-sm mx-auto leading-relaxed">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  variant,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "warning" | "danger";
  icon?: React.ReactNode;
  href?: string;
}) {
  const styles = {
    default: "bg-surface border-stone-200/80",
    warning: "bg-amber-50/80 border-amber-200/80",
    danger: "bg-red-50/80 border-red-200/80",
  };
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        {icon && <span className="text-stone-400 mt-0.5">{icon}</span>}
      </div>
      <p className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 mt-3">{value}</p>
      <p className="text-xs font-medium text-stone-500 mt-1 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </>
  );
  const className = cn(
    "border rounded-2xl p-5 shadow-sm shadow-stone-200/30 block",
    styles[variant ?? "default"],
    href && "hover:border-brand-300 transition-colors"
  );
  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

export function PropertyTabs({
  properties,
  activeId,
  basePath,
  params = {},
}: {
  properties: { id: string; name: string }[];
  activeId?: string;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (properties.length <= 1) return null;

  return (
    <div className="flex gap-2 mb-8 flex-wrap">
      {properties.map((p) => (
        <Link
          key={p.id}
          href={queryUrl(basePath, { ...params, property: p.id })}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
            p.id === activeId
              ? "bg-brand-700 text-white shadow-sm"
              : "bg-surface text-stone-600 border border-stone-200 hover:border-brand-300 hover:text-brand-800"
          )}
        >
          {p.name}
        </Link>
      ))}
    </div>
  );
}

export function FilterTabs({
  items,
  activeKey,
  basePath,
  paramName,
  params = {},
}: {
  items: { key: string; label: string }[];
  activeKey: string;
  basePath: string;
  paramName: string;
  params?: Record<string, string | undefined>;
}) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {items.map((item) => (
        <Link
          key={item.key}
          href={queryUrl(basePath, { ...params, [paramName]: item.key === "all" ? undefined : item.key })}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            item.key === activeKey
              ? "bg-brand-100 text-brand-900 ring-1 ring-brand-200"
              : "text-stone-600 hover:bg-stone-100"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-stone-700 mb-1.5">{label}</span>}
      <input
        className="w-full bg-surface border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-stone-700 mb-1.5">{label}</span>}
      <select
        className="w-full bg-surface border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-stone-700 mb-1.5">{label}</span>}
      <textarea
        className="w-full bg-surface border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-y min-h-[96px] transition-shadow"
        {...props}
      />
    </label>
  );
}

export function Callout({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning";
}) {
  const styles = {
    info: "bg-brand-50 border-brand-200/80 text-brand-900",
    warning: "bg-amber-50 border-amber-200/80 text-amber-900",
  };
  return (
    <div className={cn("mb-6 p-4 border rounded-2xl text-sm leading-relaxed", styles[variant])}>
      {children}
    </div>
  );
}

export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full bg-surface border border-stone-200 rounded-2xl px-5 py-3.5 text-base text-stone-900 placeholder:text-stone-400 shadow-sm shadow-stone-200/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
      {...props}
    />
  );
}
