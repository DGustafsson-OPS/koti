import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
        {subtitle && <p className="text-stone-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const cls = cn(
    "bg-white border border-stone-200 rounded-xl p-5 shadow-sm",
    href && "hover:border-brand-500 hover:shadow-md transition-all cursor-pointer block",
    className
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
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
    default: "bg-stone-100 text-stone-600",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", colors[variant])}>
      {children}
    </span>
  );
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50",
    ghost: "text-stone-600 hover:bg-stone-100",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 text-stone-400">
      <p className="mb-4">{message}</p>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  variant,
}: {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "warning" | "danger";
}) {
  const border = {
    default: "border-stone-200",
    warning: "border-amber-200 bg-amber-50",
    danger: "border-red-200 bg-red-50",
  };
  return (
    <div className={cn("bg-white border rounded-xl p-4", border[variant ?? "default"])}>
      <p className="text-xs text-stone-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold mt-1 text-stone-900">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-stone-700 mb-1">{label}</span>}
      <input
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
      {label && <span className="block text-sm font-medium text-stone-700 mb-1">{label}</span>}
      <select
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
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
      {label && <span className="block text-sm font-medium text-stone-700 mb-1">{label}</span>}
      <textarea
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y min-h-[80px]"
        {...props}
      />
    </label>
  );
}
