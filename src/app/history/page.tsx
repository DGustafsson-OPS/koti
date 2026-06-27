import { History } from "lucide-react";
import { getProperties, getAllHistory } from "@/lib/queries";
import { PageContainer, PageHeader, Card, EmptyState, PropertyTabs } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getDictionary} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { property: propertyId } = await searchParams;
  const properties = await getProperties();
  const activePropertyId = propertyId ?? properties[0]?.id;
  const events = await getAllHistory(activePropertyId);

  return (
    <PageContainer size="narrow">
      <PageHeader title={dict.history.title} subtitle={dict.history.subtitle} />

      <PropertyTabs properties={properties} activeId={activePropertyId} basePath="/history" />

      {events.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          message={dict.history.empty}
        />
      ) : (
        <div className="relative pl-2">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-stone-200" />
          <div className="space-y-5">
            {events.map((event) => (
              <div key={event.id} className="relative pl-10">
                <div className="absolute left-0 top-5 w-[22px] h-[22px] rounded-full bg-brand-600 ring-4 ring-canvas flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <Card padding="sm">
                  <p className="font-medium text-stone-900">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-stone-500 mt-1 leading-relaxed">{event.description}</p>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-stone-400 flex-wrap">
                    <span>{formatDate(event.completedAt, locale)}</span>
                    {event.cost && <span>{formatCurrency(event.cost, locale)}</span>}
                    {event.contractor && <span>{event.contractor}</span>}
                  </div>
                  {event.notes && (
                    <p className="text-xs text-stone-500 mt-2 italic border-l-2 border-stone-200 pl-3">
                      {event.notes}
                    </p>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
