import { notFound } from "next/navigation";
import { getAsset, getProperty, getRoom, getAssetWarranties } from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Badge,
  Callout,
} from "@/components/ui";
import { formatDate, formatCurrency, daysUntil, CATEGORY_LABELS } from "@/lib/utils";

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const [property, room, warranties] = await Promise.all([
    getProperty(asset.propertyId),
    asset.roomId ? getRoom(asset.roomId) : null,
    getAssetWarranties(id),
  ]);

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={asset.name}
        subtitle={[property?.name, room?.name].filter(Boolean).join(" · ")}
        back={{ href: `/properties/${asset.propertyId}`, label: property?.name ?? "Property" }}
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Category</dt>
              <dd>
                <Badge>{CATEGORY_LABELS[asset.category] ?? asset.category}</Badge>
              </dd>
            </div>
            {asset.brand && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Brand</dt>
                <dd className="text-stone-900">{asset.brand}</dd>
              </div>
            )}
            {asset.model && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Model</dt>
                <dd className="text-stone-900">{asset.model}</dd>
              </div>
            )}
            {asset.serialNumber && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Serial</dt>
                <dd className="font-mono text-xs text-stone-900">{asset.serialNumber}</dd>
              </div>
            )}
            {asset.purchaseDate && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Purchased</dt>
                <dd className="text-stone-900">{formatDate(asset.purchaseDate)}</dd>
              </div>
            )}
            {asset.purchasePrice && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Purchase price</dt>
                <dd className="text-stone-900">{formatCurrency(asset.purchasePrice)}</dd>
              </div>
            )}
            {asset.replacementValue && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Replacement value</dt>
                <dd className="text-stone-900">{formatCurrency(asset.replacementValue)}</dd>
              </div>
            )}
          </dl>
        </Card>

        {room && (
          <Card href={`/rooms/${room.id}`}>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Location</h3>
            <p className="font-medium text-stone-900">{room.name}</p>
            {room.floor && <p className="text-sm text-stone-500 mt-1">{room.floor} floor</p>}
          </Card>
        )}
      </div>

      {asset.notes && <Callout>{asset.notes}</Callout>}

      <Section title="Warranties">
        {warranties.length === 0 ? (
          <p className="text-sm text-stone-500">No warranties recorded.</p>
        ) : (
          <div className="space-y-3">
            {warranties.map((w) => {
              const days = daysUntil(w.expiresAt);
              const expired = days < 0;
              return (
                <Card key={w.id} padding="sm">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-medium text-stone-900">{w.provider ?? "Warranty"}</p>
                      <p className="text-xs text-stone-500 mt-0.5">Expires {formatDate(w.expiresAt)}</p>
                      {w.terms && <p className="text-xs text-stone-500 mt-1">{w.terms}</p>}
                    </div>
                    <Badge variant={expired ? "red" : days <= 60 ? "yellow" : "green"}>
                      {expired ? "Expired" : `${days} days`}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
