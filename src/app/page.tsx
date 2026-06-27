import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  Home,
  Shield,
  Wallet,
} from "lucide-react";
import {
  getProperties,
  getOverdueTasks,
  getUpcomingTasks,
  getExpiringWarranties,
  getRecentHistory,
  getInventoryValue,
} from "@/lib/queries";
import {
  PageContainer,
  Section,
  Card,
  Badge,
  EmptyState,
  StatCard,
  ButtonLink,
} from "@/components/ui";
import {
  getDictionary,
  interpolate,
  priorityLabel,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { formatDate, formatCurrency, daysUntil, PRIORITY_COLORS } from "@/lib/utils";
import { queryUrl } from "@/lib/query-url";

export default async function DashboardPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const properties = await getProperties();
  const property = properties[0];

  const [overdue, upcoming, expiring, history] = await Promise.all([
    getOverdueTasks(property?.id),
    getUpcomingTasks(property?.id),
    getExpiringWarranties(property?.id),
    getRecentHistory(property?.id, 5),
  ]);

  const inventoryValue = property ? await getInventoryValue(property.id) : 0;
  const tasks = [...overdue, ...upcoming].slice(0, 6);
  const now = Math.floor(Date.now() / 1000);

  if (!property) {
    return (
      <PageContainer size="wide">
        <EmptyState
          icon={<Home className="w-7 h-7" />}
          message={dict.dashboard.welcomeBody}
          action={<ButtonLink href="/properties/new">{dict.dashboard.addFirstProperty}</ButtonLink>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide">
      <section className="relative overflow-hidden rounded-3xl bg-brand-900 text-white px-6 sm:px-8 py-8 sm:py-10 mb-8 shadow-xl shadow-brand-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-brand-700/30 blur-2xl" />
        <div className="relative">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest">
            {dict.dashboard.yourHome}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold mt-2 tracking-tight">
            {property.name}
          </h1>
          {property.address && (
            <p className="text-brand-100/90 mt-3 text-base max-w-xl">{property.address}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-6">
            <Link
              href={`/properties/${property.id}`}
              className="text-sm px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors ring-1 ring-white/20"
            >
              {dict.dashboard.viewProperty}
            </Link>
            <Link
              href="/tasks"
              className="text-sm px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors ring-1 ring-white/20"
            >
              {dict.dashboard.allTasks}
            </Link>
            <Link
              href="/search"
              className="text-sm px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors ring-1 ring-white/20"
            >
              {dict.nav.search}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label={dict.dashboard.overdueTasks}
          value={overdue.length}
          variant={overdue.length > 0 ? "danger" : "default"}
          icon={<AlertTriangle className="w-4 h-4" />}
          href={queryUrl("/tasks", { property: property.id, filter: "overdue" })}
        />
        <StatCard
          label={dict.dashboard.dueThisMonth}
          value={upcoming.length}
          icon={<Calendar className="w-4 h-4" />}
          href={queryUrl("/tasks", { property: property.id, filter: "month" })}
        />
        <StatCard
          label={dict.dashboard.warrantiesExpiring}
          value={expiring.length}
          variant={expiring.length > 0 ? "warning" : "default"}
          sub={dict.dashboard.within60Days}
          icon={<Shield className="w-4 h-4" />}
          href={expiring[0] ? `/assets/${expiring[0].asset.id}` : `/properties/${property.id}`}
        />
        <StatCard
          label={dict.dashboard.inventoryValue}
          value={formatCurrency(inventoryValue, locale)}
          icon={<Wallet className="w-4 h-4" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section
            title={dict.dashboard.tasks}
            action={
              <Link
                href={queryUrl("/tasks", { property: property.id })}
                className="text-xs text-brand-700 hover:underline font-medium"
              >
                {dict.common.viewAll}
              </Link>
            }
          >
            {tasks.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="w-6 h-6" />}
                message={dict.dashboard.noTasks}
              />
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isOverdue = task.dueDate != null && task.dueDate < now;
                  return (
                    <Card
                      key={task.id}
                      href={`/tasks/${task.id}/edit`}
                      padding="sm"
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">{task.title}</p>
                        <p className="text-sm text-stone-500 mt-0.5">
                          {formatDate(task.dueDate, locale)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isOverdue && <Badge variant="red">{dict.common.overdue}</Badge>}
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority] ?? "bg-stone-100 text-stone-600"}`}
                        >
                          {priorityLabel(dict, task.priority)}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Section>

          <Section
            title={dict.dashboard.recentHistory}
            action={
              <Link href="/history" className="text-xs text-brand-700 hover:underline font-medium">
                {dict.common.viewAll}
              </Link>
            }
          >
            {history.length === 0 ? (
              <EmptyState message={dict.dashboard.noHistory} />
            ) : (
              <div className="space-y-3">
                {history.map((event) => (
                  <Card key={event.id} href={`/events/${event.id}/edit`} padding="sm">
                    <p className="font-medium text-stone-900">{event.title}</p>
                    <p className="text-sm text-stone-500 mt-1">
                      {formatDate(event.completedAt, locale)}
                      {event.cost != null ? ` · ${formatCurrency(event.cost, locale)}` : ""}
                      {event.contractor ? ` · ${event.contractor}` : ""}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-8">
          <Section title={dict.dashboard.expiringWarranties}>
            {expiring.length === 0 ? (
              <EmptyState message={dict.dashboard.noWarranties} />
            ) : (
              <div className="space-y-3">
                {expiring.map(({ warranty, asset }) => (
                  <Card key={warranty.id} href={`/assets/${asset.id}`} padding="sm">
                    <p className="font-medium text-stone-900">{asset.name}</p>
                    <p className="text-sm text-stone-500 mt-1">
                      {formatDate(warranty.expiresAt, locale)} ·{" "}
                      {interpolate(dict.common.daysLeft, { n: daysUntil(warranty.expiresAt) })}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Section>

          <Section
            title={dict.dashboard.properties}
            action={
              <Link href="/properties" className="text-xs text-brand-700 hover:underline font-medium">
                {dict.common.manage}
              </Link>
            }
          >
            <div className="space-y-3">
              {properties.map((p) => (
                <Card key={p.id} href={`/properties/${p.id}`} padding="sm">
                  <p className="font-medium text-stone-900">{p.name}</p>
                  {p.address && <p className="text-sm text-stone-500 mt-1">{p.address}</p>}
                </Card>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </PageContainer>
  );
}
