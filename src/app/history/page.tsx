import Link from "next/link";
import { History } from "lucide-react";
import { getProperties, getAllHistory } from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  EmptyState,
  PropertyTabs,
  Panel,
  Select,
  Input,
  Button,
} from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import { queryUrl } from "@/lib/query-url";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { CreateHistoryForm } from "@/components/forms/create-history-form";
import { db } from "@/db";
import { assets, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string; room?: string; contractor?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { property: propertyId, room: roomId, contractor } = await searchParams;
  const properties = await getProperties();
  const activePropertyId = propertyId ?? properties[0]?.id;

  const events = await getAllHistory(activePropertyId, {
    roomId: roomId || undefined,
    contractor: contractor || undefined,
  });

  const propertyRooms = activePropertyId
    ? await db.select().from(rooms).where(eq(rooms.propertyId, activePropertyId))
    : [];
  const propertyAssets = activePropertyId
    ? await db.select().from(assets).where(eq(assets.propertyId, activePropertyId))
    : [];

  return (
    <PageContainer size="wide">
      <PageHeader title={dict.history.title} subtitle={dict.history.subtitle} />

      <PropertyTabs
        properties={properties}
        activeId={activePropertyId}
        basePath="/history"
        params={{ room: roomId, contractor }}
      />

      <form
        action="/history"
        method="get"
        className="flex flex-wrap gap-3 mb-6 items-end"
      >
        {activePropertyId && <input type="hidden" name="property" value={activePropertyId} />}
        {propertyRooms.length > 0 && (
          <Select label={dict.filters.filterByRoom} name="room" defaultValue={roomId ?? ""}>
            <option value="">{dict.filters.allRooms}</option>
            {propertyRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        )}
        <Input
          label={dict.filters.filterByContractor}
          name="contractor"
          defaultValue={contractor ?? ""}
          placeholder={dict.tasks.contractorPlaceholder}
        />
        <Button type="submit" variant="secondary">
          {dict.filters.apply}
        </Button>
        {(roomId || contractor) && (
          <Link
            href={queryUrl("/history", { property: activePropertyId })}
            className="text-sm text-brand-700 hover:underline pb-2.5"
          >
            {dict.filters.clear}
          </Link>
        )}
      </form>

      {activePropertyId && (
        <Panel title={dict.history.newEvent} className="mb-8">
          <CreateHistoryForm
            propertyId={activePropertyId}
            rooms={propertyRooms}
            assets={propertyAssets}
          />
        </Panel>
      )}

      {events.length === 0 ? (
        <EmptyState icon={<History className="w-6 h-6" />} message={dict.history.empty} />
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
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{event.title}</p>
                      {event.description && (
                        <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                          {event.description}
                        </p>
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
                    </div>
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="text-xs text-brand-700 hover:underline font-medium shrink-0"
                    >
                      {dict.common.edit}
                    </Link>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
