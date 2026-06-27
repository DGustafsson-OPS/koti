import Link from "next/link";
import { getProperties } from "@/lib/queries";
import { PageHeader, Card, EmptyState } from "@/components/ui";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Properties"
        subtitle="Your homes and rental properties"
        action={
          <Link
            href="/properties/new"
            className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            Add property
          </Link>
        }
      />

      {properties.length === 0 ? (
        <EmptyState message="No properties yet" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {properties.map((p) => (
            <Card key={p.id} href={`/properties/${p.id}`}>
              <h3 className="font-semibold text-lg">{p.name}</h3>
              {p.address && <p className="text-stone-500 text-sm mt-1">{p.address}</p>}
              <div className="flex gap-3 mt-3 text-xs text-stone-400">
                {p.propertyType && <span className="capitalize">{p.propertyType}</span>}
                {p.yearBuilt && <span>Built {p.yearBuilt}</span>}
                {p.sizeSqm && <span>{p.sizeSqm} m²</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
