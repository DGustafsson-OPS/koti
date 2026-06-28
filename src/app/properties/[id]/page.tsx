import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProperty,
  getBuildings,
  getRooms,
  getAssets,
  getMaterials,
  getTasks,
  getAttachments,
} from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Badge,
  StatCard,
  Callout,
  ButtonLink,
} from "@/components/ui";
import {
  getDictionary,
  categoryLabel,
  interpolate,
  propertyTypeLabel,
  buildingTypeLabel,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { CreateRoomForm } from "@/components/forms/create-room-form";
import { CreateBuildingForm } from "@/components/forms/create-building-form";
import { CreateAssetForm } from "@/components/forms/create-asset-form";
import { CreateMaterialForm } from "@/components/forms/create-material-form";
import { CreateTaskForm } from "@/components/forms/create-task-form";
import { AttachmentsSection } from "@/components/attachments-section";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const [buildings, rooms, assets, materials, pendingTasks, attachmentList] = await Promise.all([
    getBuildings(id),
    getRooms(id),
    getAssets(id),
    getMaterials(id),
    getTasks(id),
    getAttachments("property", id),
  ]);

  return (
    <PageContainer size="wide">
      <PageHeader
        title={property.name}
        subtitle={property.address ?? undefined}
        back={{ href: "/properties", label: dict.common.allProperties }}
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/properties/${id}/import`} variant="secondary">
              {dict.import.title}
            </ButtonLink>
            <ButtonLink href={`/properties/${id}/edit`} variant="secondary">
              {dict.common.edit}
            </ButtonLink>
          </div>
        }
      />

      {(property.propertyType || property.yearBuilt || property.sizeSqm) && (
        <div className="flex flex-wrap gap-3 mb-6 text-sm text-stone-500">
          {property.propertyType && (
            <span>{propertyTypeLabel(dict, property.propertyType)}</span>
          )}
          {property.yearBuilt && (
            <span>{interpolate(dict.common.built, { year: property.yearBuilt })}</span>
          )}
          {property.sizeSqm && (
            <span>{interpolate(dict.common.sqm, { n: property.sizeSqm })}</span>
          )}
        </div>
      )}

      {property.notes && <Callout variant="warning">{property.notes}</Callout>}

      <div className="grid grid-cols-2 gap-4 mb-10 max-w-md">
        <StatCard label={dict.property.rooms} value={rooms.length} />
        <StatCard label={dict.property.assets} value={assets.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <Section title={dict.property.buildingsAndRooms} className="lg:col-span-2">
          <div className="space-y-8">
            {buildings.map((building) => {
              const buildingRooms = rooms.filter((r) => r.buildingId === building.id);
              return (
                <div key={building.id}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-stone-900">
                        {building.name}
                      </h3>
                      {building.buildingType && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          {buildingTypeLabel(dict, building.buildingType)}
                        </p>
                      )}
                      {building.notes && (
                        <p className="text-xs text-stone-400 mt-1">{building.notes}</p>
                      )}
                    </div>
                    <Link
                      href={`/buildings/${building.id}/edit`}
                      className="text-xs text-brand-700 hover:underline font-medium shrink-0"
                    >
                      {dict.common.edit}
                    </Link>
                  </div>
                  {buildingRooms.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                      {buildingRooms.map((room) => (
                        <Card key={room.id} href={`/rooms/${room.id}`} padding="sm">
                          <p className="font-medium text-stone-900">{room.name}</p>
                          {room.floor && (
                            <p className="text-xs text-stone-500 mt-1">
                              {interpolate(dict.common.floor, { floor: room.floor })}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500 mb-3">{dict.building.noRooms}</p>
                  )}
                  <CreateRoomForm
                    propertyId={id}
                    buildings={buildings}
                    defaultBuildingId={building.id}
                  />
                </div>
              );
            })}
          </div>
          <CreateBuildingForm propertyId={id} />
        </Section>

        <Section title={dict.property.materials}>
          {materials.length > 0 && (
            <div className="space-y-3 mb-4">
              {materials.map((m) => (
                <Card key={m.id} href={`/materials/${m.id}/edit`} padding="sm" className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-stone-900">{m.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {[m.brand, m.colorCode, m.finish].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge>{categoryLabel(dict, m.category)}</Badge>
                </Card>
              ))}
            </div>
          )}
          <CreateMaterialForm propertyId={id} rooms={rooms} />
        </Section>

        <Section title={dict.property.assets}>
          {assets.length > 0 && (
            <div className="space-y-3 mb-4">
              {assets.map((a) => (
                <Card key={a.id} href={`/assets/${a.id}`} padding="sm" className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-stone-900">{a.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {[a.brand, a.model].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge>{categoryLabel(dict, a.category)}</Badge>
                </Card>
              ))}
            </div>
          )}
          <CreateAssetForm propertyId={id} rooms={rooms} />
        </Section>

        <Section
          title={dict.property.pendingTasks}
          action={
            <Link href={`/tasks?property=${id}`} className="text-xs text-brand-700 hover:underline font-medium">
              {dict.property.viewAllTasks}
            </Link>
          }
        >
          {pendingTasks.length > 0 && (
            <div className="space-y-3 mb-4">
              {pendingTasks.slice(0, 5).map((t) => (
                <Card key={t.id} href={`/tasks/${t.id}/edit`} padding="sm">
                  <p className="font-medium text-sm text-stone-900">{t.title}</p>
                </Card>
              ))}
            </div>
          )}
          <CreateTaskForm propertyId={id} rooms={rooms} assets={assets} />
        </Section>

        <Section title={dict.attachments.title} className="lg:col-span-2">
          <AttachmentsSection
            propertyId={id}
            entityType="property"
            entityId={id}
            attachments={attachmentList}
            locale={locale}
          />
        </Section>
      </div>
    </PageContainer>
  );
}
