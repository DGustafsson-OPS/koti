import Link from "next/link";
import {
  getProperties,
  getOverdueTasks,
  getUpcomingTasks,
  getExpiringWarranties,
  getRecentHistory,
  getInventoryValue,
} from "@/lib/queries";
import { PageHeader, StatCard, Section, Card, Badge, EmptyState } from "@/components/ui";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Dashboard"
        subtitle={property ? property.name : "Welcome to Koti"}
        action={
          !property ? (
            <Link
              href="/properties/new"
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
            >
              Add your first property
            </Link>
          ) : undefined
        }
      />

      {property && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          <div className="grid md:grid-cols-2 gap-8">
            <Section
              title="Overdue & Upcoming"
              action={
                <Link href="/tasks" className="text-xs text-brand-600 hover:underline">
                  View all
                </Link>
              }
            >
              {overdue.length === 0 && upcoming.length === 0 ? (
                <EmptyState message="No pending tasks" />
              ) : (
                <div className="space-y-2">
                  {[...overdue, ...upcoming].slice(0, 6).map((task) => {
                    const isOverdue = task.dueDate && task.dueDate < Date.now() / 1000;
                    return (
                      <Card key={task.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-stone-400">{formatDate(task.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverdue && <Badge variant="red">Overdue</Badge>}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] ?? ""}`}
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

            <Section title="Expiring Warranties">
              {expiring.length === 0 ? (
                <EmptyState message="No warranties expiring soon" />
              ) : (
                <div className="space-y-2">
                  {expiring.map(({ warranty, asset }) => (
                    <Card key={warranty.id} href={`/assets/${asset.id}`} className="p-3">
                      <p className="font-medium text-sm">{asset.name}</p>
                      <p className="text-xs text-stone-400">
                        Expires {formatDate(warranty.expiresAt)} · {daysUntil(warranty.expiresAt)} days
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Recent History"
              action={
                <Link href="/history" className="text-xs text-brand-600 hover:underline">
                  View all
                </Link>
              }
            >
              {history.length === 0 ? (
                <EmptyState message="No maintenance history yet" />
              ) : (
                <div className="space-y-2">
                  {history.map((event) => (
                    <Card key={event.id} className="p-3">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-stone-400">
                        {formatDate(event.completedAt)}
                        {event.cost ? ` · ${formatCurrency(event.cost)}` : ""}
                        {event.contractor ? ` · ${event.contractor}` : ""}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Properties"
              action={
                <Link href="/properties" className="text-xs text-brand-600 hover:underline">
                  Manage
                </Link>
              }
            >
              <div className="space-y-2">
                {properties.map((p) => (
                  <Card key={p.id} href={`/properties/${p.id}`} className="p-3">
                    <p className="font-medium text-sm">{p.name}</p>
                    {p.address && <p className="text-xs text-stone-400">{p.address}</p>}
                  </Card>
                ))}
              </div>
            </Section>
          </div>
        </>
      )}

      {!property && (
        <EmptyState
          message="No properties yet. Add your home to get started."
          action={
            <Link
              href="/properties/new"
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
            >
              Create property
            </Link>
          }
        />
      )}
    </div>
  );
}
