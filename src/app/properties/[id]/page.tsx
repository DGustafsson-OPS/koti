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
import { PageHeader, Card, Section, Badge, StatCard } from "@/components/ui";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/utils";
import { CreateRoomForm } from "@/components/forms/create-room-form";
import { CreateAssetForm } from "@/components/forms/create-asset-form";
import { CreateMaterialForm } from "@/components/forms/create-material-form";
import { CreateTaskForm } from "@/components/forms/create-task-form";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title={property.name}
        subtitle={property.address ?? undefined}
        action={
          <Link href="/properties" className="text-sm text-stone-500 hover:text-stone-700">
            ← All properties
          </Link>
        }
      />

      {property.notes && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          {property.notes}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Rooms" value={rooms.length} />
        <StatCard label="Assets" value={assets.length} />
        <StatCard label="Inventory value" value={formatCurrency(inventoryValue)} />
      </div>

      <Section title="Rooms">
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {rooms.map((room) => (
            <Card key={room.id} href={`/rooms/${room.id}`}>
              <p className="font-medium">{room.name}</p>
              {room.floor && <p className="text-xs text-stone-400 mt-1">{room.floor} floor</p>}
            </Card>
          ))}
        </div>
        <CreateRoomForm propertyId={id} />
      </Section>

      <Section title="Materials">
        {materials.length > 0 && (
          <div className="space-y-2 mb-4">
            {materials.map((m) => (
              <Card key={m.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-stone-400">
                    {[m.brand, m.colorCode, m.finish].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Badge>{CATEGORY_LABELS[m.category] ?? m.category}</Badge>
              </Card>
            ))}
          </div>
        )}
        <CreateMaterialForm propertyId={id} rooms={rooms} />
      </Section>

      <Section title="Assets">
        {assets.length > 0 && (
          <div className="space-y-2 mb-4">
            {assets.map((a) => (
              <Card key={a.id} href={`/assets/${a.id}`} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-xs text-stone-400">
                    {[a.brand, a.model].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Badge>{CATEGORY_LABELS[a.category] ?? a.category}</Badge>
              </Card>
            ))}
          </div>
        )}
        <CreateAssetForm propertyId={id} rooms={rooms} />
      </Section>

      <Section
        title="Pending tasks"
        action={
          <Link href={`/tasks?property=${id}`} className="text-xs text-brand-600 hover:underline">
            View all
          </Link>
        }
      >
        {pendingTasks.length > 0 && (
          <div className="space-y-2 mb-4">
            {pendingTasks.slice(0, 5).map((t) => (
              <Card key={t.id} className="p-3">
                <p className="font-medium text-sm">{t.title}</p>
              </Card>
            ))}
          </div>
        )}
        <CreateTaskForm propertyId={id} rooms={rooms} assets={assets} />
      </Section>
    </div>
  );
}
