import {
  getProperties,
  getProperty,
  fetchPropertyKotiakkuLatest,
  fetchPropertyKotiakkuHistory,
} from "@/lib/queries";
import { propertyHasKotiakku, KotiakkuApiError } from "@/lib/kotiakku";
import { PageContainer, PageHeader, Callout, PropertyTabs, EmptyState, ButtonLink } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { KotiakkuConnectForm } from "@/components/kotiakku/kotiakku-connect-form";
import { KotiakkuSnapshot } from "@/components/kotiakku/kotiakku-snapshot";
import { KotiakkuDisconnectButton } from "@/components/kotiakku/kotiakku-disconnect-button";
import { EnergyPropertyHeader } from "@/components/kotiakku/energy-property-header";
import { Home } from "lucide-react";

export default async function EnergyPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const k = dict.kotiakku;

  const { property: propertyId } = await searchParams;
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
  let fetchError: string | null = null;

  if (connected && activePropertyId) {
    try {
      [latest, history] = await Promise.all([
        fetchPropertyKotiakkuLatest(activePropertyId),
        fetchPropertyKotiakkuHistory(activePropertyId, 24),
      ]);
    } catch (error) {
      if (error instanceof KotiakkuApiError && error.status === 429) {
        fetchError = k.errorRateLimit;
      } else {
        fetchError = k.errorFetch;
      }
    }
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        title={k.title}
        subtitle={k.subtitle}
        action={
          connected && activePropertyId ? (
            <KotiakkuDisconnectButton propertyId={activePropertyId} />
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
              {fetchError && (
                <div className="mb-6">
                  <Callout variant="warning">{fetchError}</Callout>
                </div>
              )}
              {latest ? (
                <KotiakkuSnapshot latest={latest} history={history} locale={locale} dict={dict} />
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
