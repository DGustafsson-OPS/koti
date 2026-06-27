import Link from "next/link";
import {
  getProperties,
  getOverdueTasks,
  getUpcomingTasks,
  getExpiringWarranties,
  getRecentHistory,
  getInventoryValue,
} from "@/lib/queries";
import { Section, Card, Badge, EmptyState, StatCard } from "@/components/ui";
import { formatDate, formatCurrency, daysUntil, PRIORITY_COLORS } from "@/lib/utils";

export default async function DashboardPage() {
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
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 text-3xl mb-6">
            ⌂
          </div>
          <h1 className="text-3xl font-bold text-stone-900">Welcome to Koti</h1>
          <p className="text-stone-500 mt-3 leading-relaxed">
            Start by adding your home — then track rooms, materials, tasks, and maintenance history
            in one place.
          </p>
          <Link
            href="/properties/new"
            className="inline-flex items-center mt-8 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 shadow-sm"
          >
            Add your first property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white px-6 py-8 mb-8 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_55%)]" />
        <div className="relative">
          <p className="text-brand-100 text-sm font-medium tracking-wide uppercase">Your home</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">{property.name}</h1>
          {property.address && (
            <p className="text-brand-100/90 mt-2 text-sm sm:text-base">{property.address}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={`/properties/${property.id}`}
              className="text-sm px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              View property
            </Link>
            <Link
              href="/tasks"
              className="text-sm px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              All tasks
            </Link>
            <Link
              href="/search"
              className="text-sm px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Overdue tasks"
          value={overdue.length}
          variant={overdue.length > 0 ? "danger" : "default"}
        />
        <StatCard label="Due this month" value={upcoming.length} />
        <StatCard
          label="Warranties expiring"
          value={expiring.length}
          variant={expiring.length > 0 ? "warning" : "default"}
          sub="Within 60 days"
        />
        <StatCard label="Inventory value" value={formatCurrency(inventoryValue)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section
            title="Tasks"
            action={
              <Link href="/tasks" className="text-xs text-brand-600 hover:underline font-medium">
                View all
              </Link>
            }
          >
            {tasks.length === 0 ? (
              <EmptyState message="No pending tasks — you're all caught up." />
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isOverdue = task.dueDate != null && task.dueDate < now;
                  return (
                    <Card key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">{task.title}</p>
                        <p className="text-sm text-stone-500 mt-0.5">{formatDate(task.dueDate)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isOverdue && <Badge variant="red">Overdue</Badge>}
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority] ?? "bg-stone-100 text-stone-600"}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Section>

          <Section
            title="Recent history"
            action={
              <Link href="/history" className="text-xs text-brand-600 hover:underline font-medium">
                View all
              </Link>
            }
          >
            {history.length === 0 ? (
              <EmptyState message="No maintenance history yet." />
            ) : (
              <div className="space-y-3">
                {history.map((event) => (
                  <Card key={event.id} className="p-4">
                    <p className="font-medium text-stone-900">{event.title}</p>
                    <p className="text-sm text-stone-500 mt-1">
                      {formatDate(event.completedAt)}
                      {event.cost != null ? ` · ${formatCurrency(event.cost)}` : ""}
                      {event.contractor ? ` · ${event.contractor}` : ""}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-8">
          <Section title="Expiring warranties">
            {expiring.length === 0 ? (
              <EmptyState message="No warranties expiring in the next 60 days." />
            ) : (
              <div className="space-y-3">
                {expiring.map(({ warranty, asset }) => (
                  <Card key={warranty.id} href={`/assets/${asset.id}`} className="p-4">
                    <p className="font-medium text-stone-900">{asset.name}</p>
                    <p className="text-sm text-stone-500 mt-1">
                      {formatDate(warranty.expiresAt)} · {daysUntil(warranty.expiresAt)} days left
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Properties"
            action={
              <Link href="/properties" className="text-xs text-brand-600 hover:underline font-medium">
                Manage
              </Link>
            }
          >
            <div className="space-y-3">
              {properties.map((p) => (
                <Card key={p.id} href={`/properties/${p.id}`} className="p-4">
                  <p className="font-medium text-stone-900">{p.name}</p>
                  {p.address && <p className="text-sm text-stone-500 mt-1">{p.address}</p>}
                </Card>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
