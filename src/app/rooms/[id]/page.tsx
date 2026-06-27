import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRoom,
  getProperty,
  getBuilding,
  getRoomMaterials,
  getRoomNotes,
  getRoomAssets,
  getRoomTasks,
  getRoomHistory,
  getAttachments,
} from "@/lib/queries";
import {
  PageContainer,
  PageHeader,
  Card,
  Section,
  Badge,
  Callout,
  ButtonLink,
} from "@/components/ui";
import { formatDate, formatCurrency, PRIORITY_COLORS } from "@/lib/utils";
import {
  getDictionary,
  categoryLabel,
  interpolate,
  priorityLabel,
} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { CreateNoteForm } from "@/components/forms/create-note-form";
import { AttachmentsSection } from "@/components/attachments-section";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const { id } = await params;
  const room = await getRoom(id);
  if (!room) notFound();

  const property = await getProperty(room.propertyId);
  const building = room.buildingId ? await getBuilding(room.buildingId) : null;
  const [materials, roomNotes, assets, pendingTasks, history, attachmentList] = await Promise.all([
    getRoomMaterials(id),
    getRoomNotes(id),
    getRoomAssets(id),
    getRoomTasks(id),
    getRoomHistory(id),
    getAttachments("room", id),
  ]);

  const subtitle = [
    property?.name,
    building?.name,
    room.floor ? interpolate(dict.common.floor, { floor: room.floor }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageContainer size="wide">
      <PageHeader
        title={room.name}
        subtitle={subtitle}
        back={{
          href: `/properties/${room.propertyId}`,
          label: property?.name ?? dict.common.property,
        }}
        action={
          <ButtonLink href={`/rooms/${id}/edit`} variant="secondary">
            {dict.common.edit}
          </ButtonLink>
        }
      />

      {room.notes && <Callout>{room.notes}</Callout>}

      <div className="grid md:grid-cols-2 gap-10">
        <Section title={dict.room.materialsFinishes}>
          {materials.length === 0 ? (
            <p className="text-sm text-stone-500">{dict.room.noMaterials}</p>
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
                    <Badge>{categoryLabel(dict, material.category)}</Badge>
                  </div>
                  {material.leftoverLocation && (
                    <p className="text-xs text-brand-700 mt-2">
                      {interpolate(dict.common.leftover, { location: material.leftoverLocation })}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title={dict.room.inventoryAssets}>
          {assets.length === 0 ? (
            <p className="text-sm text-stone-500">{dict.room.noAssets}</p>
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

        <Section title={dict.room.tasks}>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-stone-500">{dict.room.noTasks}</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((t) => (
                <Card key={t.id} padding="sm" className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{t.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{formatDate(t.dueDate, locale)}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${PRIORITY_COLORS[t.priority] ?? ""}`}
                  >
                    {priorityLabel(dict, t.priority)}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title={dict.room.history}>
          {history.length === 0 ? (
            <p className="text-sm text-stone-500">{dict.room.noHistory}</p>
          ) : (
            <div className="space-y-3">
              {history.map((e) => (
                <Card key={e.id} padding="sm">
                  <p className="font-medium text-stone-900">{e.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {formatDate(e.completedAt, locale)}
                    {e.cost ? ` · ${formatCurrency(e.cost, locale)}` : ""}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Section>

        <Section title={dict.attachments.title} className="md:col-span-2">
          <AttachmentsSection
            propertyId={room.propertyId}
            entityType="room"
            entityId={id}
            attachments={attachmentList}
            locale={locale}
          />
        </Section>

        <Section title={dict.room.notes} className="md:col-span-2">
          {roomNotes.length > 0 && (
            <div className="space-y-3 mb-4">
              {roomNotes.map((n) => (
                <Card key={n.id} padding="sm">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-stone-700">{n.content}</p>
                      <p className="text-xs text-stone-400 mt-2">{formatDate(n.createdAt, locale)}</p>
                    </div>
                    <Link
                      href={`/notes/${n.id}/edit`}
                      className="text-xs text-brand-700 hover:underline font-medium shrink-0"
                    >
                      {dict.common.edit}
                    </Link>
                  </div>
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
