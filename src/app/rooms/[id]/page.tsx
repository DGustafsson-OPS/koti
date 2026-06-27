import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getRoom,
  getProperty,
  getRoomMaterials,
  getRoomNotes,
  getRoomAssets,
  getRoomTasks,
  getRoomHistory,
} from "@/lib/queries";
import { PageHeader, Card, Section, Badge } from "@/components/ui";
import { formatDate, formatCurrency, CATEGORY_LABELS, PRIORITY_COLORS } from "@/lib/utils";
import { CreateNoteForm } from "@/components/forms/create-note-form";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await getRoom(id);
  if (!room) notFound();

  const property = await getProperty(room.propertyId);
  const [materials, roomNotes, assets, pendingTasks, history] = await Promise.all([
    getRoomMaterials(id),
    getRoomNotes(id),
    getRoomAssets(id),
    getRoomTasks(id),
    getRoomHistory(id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title={room.name}
        subtitle={[property?.name, room.floor ? `${room.floor} floor` : null]
          .filter(Boolean)
          .join(" · ")}
        action={
          <Link href={`/properties/${room.propertyId}`} className="text-sm text-stone-500 hover:text-stone-700">
            ← Back to property
          </Link>
        }
      />

      {room.notes && (
        <div className="mb-6 p-4 bg-stone-100 rounded-xl text-sm text-stone-600">{room.notes}</div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Section title="Materials & Finishes">
          {materials.length === 0 ? (
            <p className="text-sm text-stone-400">No materials linked to this room</p>
          ) : (
            <div className="space-y-2">
              {materials.map(({ roomMaterial, material }) => (
                <Card key={roomMaterial.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-xs text-stone-400">
                        {[material.brand, material.colorCode, material.finish]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {roomMaterial.surface && (
                        <p className="text-xs text-stone-400 mt-1 capitalize">
                          {roomMaterial.surface}
                        </p>
                      )}
                    </div>
                    <Badge>{CATEGORY_LABELS[material.category] ?? material.category}</Badge>
                  </div>
                  {material.leftoverLocation && (
                    <p className="text-xs text-brand-600 mt-2">Leftover: {material.leftoverLocation}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="Inventory & Assets">
          {assets.length === 0 ? (
            <p className="text-sm text-stone-400">No assets in this room</p>
          ) : (
            <div className="space-y-2">
              {assets.map((a) => (
                <Card key={a.id} href={`/assets/${a.id}`} className="p-3">
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-xs text-stone-400">
                    {[a.brand, a.model].filter(Boolean).join(" · ")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="Tasks">
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-stone-400">No pending tasks</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((t) => (
                <Card key={t.id} className="p-3 flex justify-between">
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-stone-400">{formatDate(t.dueDate)}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full h-fit ${PRIORITY_COLORS[t.priority] ?? ""}`}
                  >
                    {t.priority}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="History">
          {history.length === 0 ? (
            <p className="text-sm text-stone-400">No history for this room</p>
          ) : (
            <div className="space-y-2">
              {history.map((e) => (
                <Card key={e.id} className="p-3">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-stone-400">
                    {formatDate(e.completedAt)}
                    {e.cost ? ` · ${formatCurrency(e.cost)}` : ""}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="Notes">
          {roomNotes.length > 0 && (
            <div className="space-y-2 mb-4">
              {roomNotes.map((n) => (
                <Card key={n.id} className="p-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-stone-400 mt-1">{formatDate(n.createdAt)}</p>
                </Card>
              ))}
            </div>
          )}
          <CreateNoteForm roomId={id} />
        </Section>
      </div>
    </div>
  );
}
