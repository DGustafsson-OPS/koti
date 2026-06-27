import { notFound } from "next/navigation";
import Link from "next/link";
import { getAsset, getProperty, getRoom, getAssetWarranties } from "@/lib/queries";
import { PageHeader, Card, Section, Badge } from "@/components/ui";
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        title={asset.name}
        subtitle={[property?.name, room?.name].filter(Boolean).join(" · ")}
        action={
          <Link
            href={`/properties/${asset.propertyId}`}
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            ← Back to property
          </Link>
        }
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-xs font-semibold text-stone-500 uppercase mb-3">Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Category</dt>
              <dd>
                <Badge>{CATEGORY_LABELS[asset.category] ?? asset.category}</Badge>
              </dd>
            </div>
            {asset.brand && (
              <div className="flex justify-between">
                <dt className="text-stone-500">Brand</dt>
                <dd>{asset.brand}</dd>
              </div>
            )}
            {asset.model && (
              <div className="flex justify-between">
                <dt className="text-stone-500">Model</dt>
                <dd>{asset.model}</dd>
              </div>
            )}
            {asset.serialNumber && (
              <div className="flex justify-between">
                <dt className="text-stone-500">Serial</dt>
                <dd className="font-mono text-xs">{asset.serialNumber}</dd>
              </div>
            )}
            {asset.purchaseDate && (
              <div className="flex justify-between">
                <dt className="text-stone-500">Purchased</dt>
                <dd>{formatDate(asset.purchaseDate)}</dd>
              </div>
            )}
            {asset.purchasePrice && (
              <div className="flex justify-between">
                <dt className="text-stone-500">Purchase price</dt>
                <dd>{formatCurrency(asset.purchasePrice)}</dd>
              </div>
            )}
            {asset.replacementValue && (
              <div className="flex justify-between">
                <dt className="text-stone-500">Replacement value</dt>
                <dd>{formatCurrency(asset.replacementValue)}</dd>
              </div>
            )}
          </dl>
        </Card>

        {room && (
          <Card href={`/rooms/${room.id}`}>
            <h3 className="text-xs font-semibold text-stone-500 uppercase mb-2">Location</h3>
            <p className="font-medium">{room.name}</p>
            {room.floor && <p className="text-sm text-stone-400">{room.floor} floor</p>}
          </Card>
        )}
      </div>

      {asset.notes && (
        <div className="mb-6 p-4 bg-stone-100 rounded-xl text-sm">{asset.notes}</div>
      )}

      <Section title="Warranties">
        {warranties.length === 0 ? (
          <p className="text-sm text-stone-400">No warranties recorded</p>
        ) : (
          <div className="space-y-2">
            {warranties.map((w) => {
              const days = daysUntil(w.expiresAt);
              const expired = days < 0;
              return (
                <Card key={w.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{w.provider ?? "Warranty"}</p>
                      <p className="text-xs text-stone-400">Expires {formatDate(w.expiresAt)}</p>
                      {w.terms && <p className="text-xs text-stone-400 mt-1">{w.terms}</p>}
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
    </div>
  );
}
