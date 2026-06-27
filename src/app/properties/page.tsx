import { Home } from "lucide-react";
import { getProperties } from "@/lib/queries";
import { PageContainer, PageHeader, Card, EmptyState, ButtonLink } from "@/components/ui";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <PageContainer>
      <PageHeader
        title="Properties"
        subtitle="Your homes and rental properties"
        action={<ButtonLink href="/properties/new">Add property</ButtonLink>}
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={<Home className="w-6 h-6" />}
          message="No properties yet. Add your first home to start building its memory."
          action={<ButtonLink href="/properties/new">Create property</ButtonLink>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {properties.map((p) => (
            <Card key={p.id} href={`/properties/${p.id}`}>
              <h3 className="font-display text-xl font-semibold text-stone-900">{p.name}</h3>
              {p.address && <p className="text-stone-500 text-sm mt-2">{p.address}</p>}
              <div className="flex gap-3 mt-4 text-xs text-stone-400">
                {p.propertyType && <span className="capitalize">{p.propertyType}</span>}
                {p.yearBuilt && <span>Built {p.yearBuilt}</span>}
                {p.sizeSqm && <span>{p.sizeSqm} m²</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
