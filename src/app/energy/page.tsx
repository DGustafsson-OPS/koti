import {
  getProperties,
  getProperty,
  fetchPropertyKotiakkuLatest,
  fetchPropertyKotiakkuHistory,
} from "@/lib/queries";
import { propertyHasKotiakku, KotiakkuApiError } from "@/lib/kotiakku";
import { getLatestSpotPrices } from "@/lib/porssisahko";
import {
  energyRangeHours,
  parseEnergyRange,
  summarizeEnergy,
} from "@/lib/energy-analytics";
import {
  PageContainer,
  PageHeader,
  Callout,
  PropertyTabs,
  EmptyState,
  ButtonLink,
} from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { KotiakkuConnectForm } from "@/components/kotiakku/kotiakku-connect-form";
import { KotiakkuSnapshot } from "@/components/kotiakku/kotiakku-snapshot";
import { KotiakkuDisconnectButton } from "@/components/kotiakku/kotiakku-disconnect-button";
import { EnergyPropertyHeader } from "@/components/kotiakku/energy-property-header";
import { EnergyRangeTabs } from "@/components/kotiakku/energy-range-tabs";
import { EnergyTariffForm } from "@/components/kotiakku/energy-tariff-form";
import { saveEnergyTariffAction } from "@/app/energy/actions";
import { tariffFromProperty } from "@/lib/energy-tariff";
import { Home } from "lucide-react";

export default async function EnergyPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string; range?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const k = dict.kotiakku;

  const { property: propertyId, range: rangeParam } = await searchParams;
  const range = parseEnergyRange(rangeParam);
  const properties = await getProperties();
  const activePropertyId = propertyId ?? properties[0]?.id;
  const property = activePropertyId ? await getProperty(activePropertyId) : null;

  if (properties.length === 0) {
    return (
      <PageContainer size="wide">
        <PageHeader title={k.title} subtitle={k.subtitle} />
        <EmptyState
          icon={<Home className="w-7 h-7" />}
          message={dict.dashboard.welcomeBody}
          action={<ButtonLink href="/properties/new">{dict.dashboard.addFirstProperty}</ButtonLink>}
        />
      </PageContainer>
    );
  }

  const connected = property ? propertyHasKotiakku(property) : false;
  const connectedPropertyIds = properties
    .filter((p) => propertyHasKotiakku(p))
    .map((p) => p.id);

  let latest = null;
  let history: Awaited<ReturnType<typeof fetchPropertyKotiakkuHistory>> = [];
  let spotSlots: Awaited<ReturnType<typeof getLatestSpotPrices>> = [];
  let fetchError: string | null = null;

  if (connected && activePropertyId) {
    try {
      const hours = energyRangeHours(range);
      [latest, history, spotSlots] = await Promise.all([
        fetchPropertyKotiakkuLatest(activePropertyId),
        fetchPropertyKotiakkuHistory(activePropertyId, hours),
        getLatestSpotPrices().catch(() => []),
      ]);
    } catch (error) {
      if (error instanceof KotiakkuApiError && error.status === 429) {
        fetchError = k.errorRateLimit;
      } else {
        fetchError = k.errorFetch;
      }
    }
  }

  const summary = summarizeEnergy(
    history,
    spotSlots,
    property ? tariffFromProperty(property) : undefined
  );
  const tariff = property ? tariffFromProperty(property) : null;

  return (
    <PageContainer size="wide">
      <PageHeader
        title={k.title}
        subtitle={k.subtitle}
        action={
          connected && activePropertyId ? (
            <div className="flex flex-wrap gap-2">
              <ButtonLink
                href={`/api/export/energy?property=${activePropertyId}&range=${range}`}
                variant="secondary"
              >
                {k.exportCsv}
              </ButtonLink>
              <KotiakkuDisconnectButton propertyId={activePropertyId} />
            </div>
          ) : undefined
        }
      />

      <PropertyTabs
        properties={properties}
        activeId={activePropertyId}
        basePath="/energy"
        alwaysShow
        connectedIds={connectedPropertyIds}
      />

      {property && (
        <>
          <EnergyPropertyHeader
            propertyName={property.name}
            propertyAddress={property.address}
            connected={connected}
            dict={dict}
          />

          {!connected ? (
            <KotiakkuConnectForm
              propertyId={activePropertyId!}
              propertyName={property.name}
            />
          ) : (
            <>
              <EnergyRangeTabs
                active={range}
                propertyId={activePropertyId!}
                labels={{
                  "24h": k.range24h,
                  "7d": k.range7d,
                  "30d": k.range30d,
                }}
              />

              {tariff && (
                <EnergyTariffForm
                  propertyId={activePropertyId!}
                  tariff={tariff}
                  saveAction={saveEnergyTariffAction}
                />
              )}

              {fetchError && (
                <div className="mb-6">
                  <Callout variant="warning">{fetchError}</Callout>
                </div>
              )}
              {latest ? (
                <KotiakkuSnapshot
                  latest={latest}
                  history={history}
                  spotSlots={spotSlots}
                  summary={summary}
                  locale={locale}
                  dict={dict}
                />
              ) : !fetchError ? (
                <Callout variant="warning">{k.noData}</Callout>
              ) : null}
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}
