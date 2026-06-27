import { notFound } from "next/navigation";
import {
  getRoom,
  getProperty,
  getRoomMaterials,
  getRoomNotes,
  getRoomAssets,
  getRoomTasks,
  getRoomHistory,
} from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Badge,
  Callout,
} from "@/components/ui";
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
    <PageContainer>
      <PageHeader
        title={room.name}
        subtitle={[property?.name, room.floor ? `${room.floor} floor` : null]
          .filter(Boolean)
          .join(" · ")}
        back={{ href: `/properties/${room.propertyId}`, label: property?.name ?? "Property" }}
      />

      {room.notes && <Callout>{room.notes}</Callout>}

      <div className="grid md:grid-cols-2 gap-10">
        <Section title="Materials & finishes">
          {materials.length === 0 ? (
            <p className="text-sm text-stone-500">No materials linked to this room.</p>
          ) : (
            <div className="space-y-3">
              {materials.map(({ roomMaterial, material }) => (
                <Card key={roomMaterial.id} padding="sm">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-medium text-stone-900">{material.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {[material.brand, material.colorCode, material.finish]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {roomMaterial.surface && (
                        <p className="text-xs text-stone-400 mt-1 capitalize">{roomMaterial.surface}</p>
                      )}
                    </div>
                    <Badge>{CATEGORY_LABELS[material.category] ?? material.category}</Badge>
                  </div>
                  {material.leftoverLocation && (
                    <p className="text-xs text-brand-700 mt-2">Leftover: {material.leftoverLocation}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="Inventory & assets">
          {assets.length === 0 ? (
            <p className="text-sm text-stone-500">No assets in this room.</p>
          ) : (
            <div className="space-y-3">
              {assets.map((a) => (
                <Card key={a.id} href={`/assets/${a.id}`} padding="sm">
                  <p className="font-medium text-stone-900">{a.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {[a.brand, a.model].filter(Boolean).join(" · ")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="Tasks">
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-stone-500">No pending tasks.</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((t) => (
                <Card key={t.id} padding="sm" className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{t.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{formatDate(t.dueDate)}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${PRIORITY_COLORS[t.priority] ?? ""}`}
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
            <p className="text-sm text-stone-500">No history for this room.</p>
          ) : (
            <div className="space-y-3">
              {history.map((e) => (
                <Card key={e.id} padding="sm">
                  <p className="font-medium text-stone-900">{e.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {formatDate(e.completedAt)}
                    {e.cost ? ` · ${formatCurrency(e.cost)}` : ""}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title="Notes" className="md:col-span-2">
          {roomNotes.length > 0 && (
            <div className="space-y-3 mb-4">
              {roomNotes.map((n) => (
                <Card key={n.id} padding="sm">
                  <p className="text-sm leading-relaxed text-stone-700">{n.content}</p>
                  <p className="text-xs text-stone-400 mt-2">{formatDate(n.createdAt)}</p>
                </Card>
              ))}
            </div>
          )}
          <CreateNoteForm roomId={id} />
        </Section>
      </div>
    </PageContainer>
  );
}
