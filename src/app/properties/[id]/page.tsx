import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProperty,
  getRooms,
  getAssets,
  getMaterials,
  getTasks,
  getInventoryValue,
} from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Badge,
  StatCard,
  Callout,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import {
  getDictionary,
  categoryLabel,
  interpolate,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { CreateRoomForm } from "@/components/forms/create-room-form";
import { CreateAssetForm } from "@/components/forms/create-asset-form";
import { CreateMaterialForm } from "@/components/forms/create-material-form";
import { CreateTaskForm } from "@/components/forms/create-task-form";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const [rooms, assets, materials, pendingTasks, inventoryValue] = await Promise.all([
    getRooms(id),
    getAssets(id),
    getMaterials(id),
    getTasks(id),
    getInventoryValue(id),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title={property.name}
        subtitle={property.address ?? undefined}
        back={{ href: "/properties", label: dict.common.allProperties }}
      />

      {property.notes && <Callout variant="warning">{property.notes}</Callout>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label={dict.property.rooms} value={rooms.length} />
        <StatCard label={dict.property.assets} value={assets.length} />
        <StatCard
          label={dict.dashboard.inventoryValue}
          value={formatCurrency(inventoryValue, locale)}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <Section title={dict.property.rooms}>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {rooms.map((room) => (
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
          <CreateRoomForm propertyId={id} />
        </Section>

        <Section title={dict.property.materials}>
          {materials.length > 0 && (
            <div className="space-y-3 mb-4">
              {materials.map((m) => (
                <Card key={m.id} padding="sm" className="flex items-center justify-between gap-3">
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
                <Card key={t.id} padding="sm">
                  <p className="font-medium text-sm text-stone-900">{t.title}</p>
                </Card>
              ))}
            </div>
          )}
          <CreateTaskForm propertyId={id} rooms={rooms} assets={assets} />
        </Section>
      </div>
    </PageContainer>
  );
}
