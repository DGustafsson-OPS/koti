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
  ButtonLink,
  Badge,
} from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import { queryUrl } from "@/lib/query-url";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { CreateHistoryForm } from "@/components/forms/create-history-form";
import { summarizeMaintenanceCosts } from "@/lib/maintenance-costs";
import { db } from "@/db";
import { assets, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string; room?: string; contractor?: string; year?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { property: propertyId, room: roomId, contractor, year } = await searchParams;
  const properties = await getProperties();
  const activePropertyId = propertyId ?? properties[0]?.id;
  const yearFilter = year ? Number(year) : undefined;

  const events = await getAllHistory(activePropertyId, {
    roomId: roomId || undefined,
    contractor: contractor || undefined,
    year: yearFilter,
  });

  const { totalServiceCost, deductibleCost } = summarizeMaintenanceCosts(events);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 12 }, (_, i) => currentYear - i);
  const filterParams = { room: roomId, contractor, year };

  const propertyRooms = activePropertyId
    ? await db.select().from(rooms).where(eq(rooms.propertyId, activePropertyId))
    : [];
  const propertyAssets = activePropertyId
    ? await db.select().from(assets).where(eq(assets.propertyId, activePropertyId))
    : [];

  const exportHref = activePropertyId
    ? queryUrl("/api/export/maintenance", { property: activePropertyId, year })
    : undefined;

  return (
    <PageContainer size="wide">
      <PageHeader
        title={dict.history.title}
        subtitle={dict.history.subtitle}
        action={
          exportHref ? (
            <ButtonLink href={exportHref} variant="secondary">
              {dict.history.exportMaintenance}
            </ButtonLink>
          ) : undefined
        }
      />

      <PropertyTabs
        properties={properties}
        activeId={activePropertyId}
        basePath="/history"
        params={filterParams}
      />

      <form action="/history" method="get" className="flex flex-wrap gap-3 mb-6 items-end">
        {activePropertyId && <input type="hidden" name="property" value={activePropertyId} />}
        <Select label={dict.filters.filterByYear} name="year" defaultValue={year ?? ""}>
          <option value="">{dict.filters.allYears}</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
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
        <button
          type="submit"
          className="px-4 py-2.5 text-sm font-medium rounded-xl border border-stone-200 bg-surface text-stone-700 hover:border-brand-300 hover:bg-brand-50/50 transition-all"
        >
          {dict.filters.apply}
        </button>
        {(roomId || contractor || year) && (
          <Link
            href={queryUrl("/history", { property: activePropertyId })}
            className="text-sm text-brand-700 hover:underline pb-2.5"
          >
            {dict.filters.clear}
          </Link>
        )}
      </form>

      {events.length > 0 && (
        <Panel title={dict.history.serviceCosts} className="mb-8">
          <p className="text-sm text-stone-500 mb-4">{dict.history.serviceCostsHelp}</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-stone-500">{dict.history.totalServiceCost}</p>
              <p className="text-xl font-semibold text-stone-900 mt-1">
                {formatCurrency(totalServiceCost, locale)}
              </p>
            </div>
            <div>
              <p className="text-stone-500">{dict.history.totalDeductible}</p>
              <p className="text-xl font-semibold text-stone-900 mt-1">
                {formatCurrency(deductibleCost, locale)}
              </p>
            </div>
          </div>
        </Panel>
      )}

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-stone-900">{event.title}</p>
                        {event.taxDeductible && event.cost != null && (
                          <Badge variant="green">{dict.common.taxDeductible}</Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-stone-400 flex-wrap">
                        <span>{formatDate(event.completedAt, locale)}</span>
                        {event.cost != null && (
                          <span className="font-medium text-stone-600">
                            {formatCurrency(event.cost, locale)}
                          </span>
                        )}
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
