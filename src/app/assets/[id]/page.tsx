import { notFound } from "next/navigation";
import { getAsset, getProperty, getRoom, getAssetWarranties, getAttachments } from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Badge,
  Callout,
  ButtonLink,
} from "@/components/ui";
import { CreateWarrantyForm } from "@/components/forms/create-warranty-form";
import { AttachmentsSection } from "@/components/attachments-section";
import { formatDate, formatCurrency, daysUntil } from "@/lib/utils";
import {
  getDictionary,
  categoryLabel,
  interpolate,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const [property, room, warranties, attachmentList] = await Promise.all([
    getProperty(asset.propertyId),
    asset.roomId ? getRoom(asset.roomId) : null,
    getAssetWarranties(id),
    getAttachments("asset", id),
  ]);

  return (
    <PageContainer size="wide">
      <PageHeader
        title={asset.name}
        subtitle={[property?.name, room?.name].filter(Boolean).join(" · ")}
        back={{
          href: `/properties/${asset.propertyId}`,
          label: property?.name ?? dict.common.property,
        }}
        action={
          <ButtonLink href={`/assets/${id}/edit`} variant="secondary">
            {dict.common.edit}
          </ButtonLink>
        }
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">
            {dict.asset.details}
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">{dict.asset.category}</dt>
              <dd>
                <Badge>{categoryLabel(dict, asset.category)}</Badge>
              </dd>
            </div>
            {asset.brand && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">{dict.asset.brand}</dt>
                <dd className="text-stone-900">{asset.brand}</dd>
              </div>
            )}
            {asset.model && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">{dict.asset.model}</dt>
                <dd className="text-stone-900">{asset.model}</dd>
              </div>
            )}
            {asset.serialNumber && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">{dict.asset.serial}</dt>
                <dd className="font-mono text-xs text-stone-900">{asset.serialNumber}</dd>
              </div>
            )}
            {asset.purchaseDate && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">{dict.asset.purchased}</dt>
                <dd className="text-stone-900">{formatDate(asset.purchaseDate, locale)}</dd>
              </div>
            )}
            {asset.purchasePrice && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">{dict.asset.purchasePrice}</dt>
                <dd className="text-stone-900">{formatCurrency(asset.purchasePrice, locale)}</dd>
              </div>
            )}
            {asset.replacementValue && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">{dict.asset.replacementValue}</dt>
                <dd className="text-stone-900">{formatCurrency(asset.replacementValue, locale)}</dd>
              </div>
            )}
          </dl>
        </Card>

        {room && (
          <Card href={`/rooms/${room.id}`}>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
              {dict.asset.location}
            </h3>
            <p className="font-medium text-stone-900">{room.name}</p>
            {room.floor && (
              <p className="text-sm text-stone-500 mt-1">
                {interpolate(dict.common.floor, { floor: room.floor })}
              </p>
            )}
          </Card>
        )}
      </div>

      {asset.notes && <Callout>{asset.notes}</Callout>}

      <Section title={dict.asset.warranties}>
        {warranties.length === 0 ? (
          <p className="text-sm text-stone-500">{dict.asset.noWarranties}</p>
        ) : (
          <div className="space-y-3">
            {warranties.map((w) => {
              const days = daysUntil(w.expiresAt);
              const expired = days < 0;
              return (
                <Card key={w.id} href={`/warranties/${w.id}/edit`} padding="sm">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-medium text-stone-900">{w.provider ?? dict.asset.warranty}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {interpolate(dict.common.expires, {
                          date: formatDate(w.expiresAt, locale),
                        })}
                      </p>
                      {w.terms && <p className="text-xs text-stone-500 mt-1">{w.terms}</p>}
                    </div>
                    <Badge variant={expired ? "red" : days <= 60 ? "yellow" : "green"}>
                      {expired
                        ? dict.common.expired
                        : interpolate(dict.common.days, { n: days })}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        <CreateWarrantyForm assetId={id} />
      </Section>

      <Section title={dict.attachments.title} className="mt-8">
        <AttachmentsSection
          propertyId={asset.propertyId}
          entityType="asset"
          entityId={id}
          attachments={attachmentList}
          locale={locale}
        />
      </Section>
    </PageContainer>
  );
}
