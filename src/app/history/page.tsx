import Link from "next/link";
import { getProperties, getAllHistory } from "@/lib/queries";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const { property: propertyId } = await searchParams;
  const properties = await getProperties();
  const activePropertyId = propertyId ?? properties[0]?.id;
  const events = await getAllHistory(activePropertyId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title="Maintenance History" subtitle="Everything done to your home" />

      {properties.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/history?property=${p.id}`}
              className={`px-3 py-1 rounded-full text-sm border ${
                p.id === activePropertyId
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-stone-600 border-stone-300 hover:border-brand-500"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState message="No maintenance history yet. Complete a task to start building your timeline." />
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-200" />
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="relative pl-10">
                <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-brand-500 border-2 border-white" />
                <Card className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      {event.description && (
                        <p className="text-sm text-stone-500 mt-1">{event.description}</p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-stone-400 flex-wrap">
                        <span>{formatDate(event.completedAt)}</span>
                        {event.cost && <span>{formatCurrency(event.cost)}</span>}
                        {event.contractor && <span>{event.contractor}</span>}
                      </div>
                      {event.notes && (
                        <p className="text-xs text-stone-500 mt-2 italic">{event.notes}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
