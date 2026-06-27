import { Home } from "lucide-react";
import { getProperties } from "@/lib/queries";
import { PageContainer, PageHeader, Card, EmptyState, ButtonLink } from "@/components/ui";
import {
  getDictionary,
  interpolate,
  propertyTypeLabel,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function PropertiesPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const properties = await getProperties();

  return (
    <PageContainer size="wide">
      <PageHeader
        title={dict.properties.title}
        subtitle={dict.properties.subtitle}
        action={<ButtonLink href="/properties/new">{dict.properties.addProperty}</ButtonLink>}
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={<Home className="w-6 h-6" />}
          message={dict.properties.empty}
          action={<ButtonLink href="/properties/new">{dict.properties.createProperty}</ButtonLink>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {properties.map((p) => (
            <Card key={p.id} href={`/properties/${p.id}`}>
              <h3 className="font-display text-xl font-semibold text-stone-900">{p.name}</h3>
              {p.address && <p className="text-stone-500 text-sm mt-2">{p.address}</p>}
              <div className="flex gap-3 mt-4 text-xs text-stone-400">
                {p.propertyType && (
                  <span className="capitalize">{propertyTypeLabel(dict, p.propertyType)}</span>
                )}
                {p.yearBuilt && (
                  <span>{interpolate(dict.common.built, { year: p.yearBuilt })}</span>
                )}
                {p.sizeSqm && <span>{interpolate(dict.common.sqm, { n: p.sizeSqm })}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
