import { notFound, redirect } from "next/navigation";
import { getRoom, getBuildings, updateRoom, deleteRoom } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const room = await getRoom(id);
  if (!room) notFound();

  const buildings = await getBuildings(room.propertyId);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateRoom(id, {
      buildingId: formData.get("buildingId") as string,
      name: formData.get("name") as string,
      floor: (formData.get("floor") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    redirect(`/rooms/${id}`);
  }

  async function handleDelete() {
    "use server";
    await deleteRoom(id);
    redirect(`/properties/${room!.propertyId}`);
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.roomEdit.title}
        subtitle={dict.roomEdit.subtitle}
        back={{ href: `/rooms/${id}`, label: room.name }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Select
            label={dict.common.building}
            name="buildingId"
            required
            defaultValue={room.buildingId ?? buildings[0]?.id}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            label={dict.forms.roomName}
            name="name"
            required
            defaultValue={room.name}
            placeholder={dict.forms.roomNamePlaceholder}
          />
          <Input
            label={dict.forms.floor}
            name="floor"
            defaultValue={room.floor ?? ""}
            placeholder={dict.forms.floorPlaceholder}
          />
          <Input
            label={dict.forms.notes}
            name="notes"
            defaultValue={room.notes ?? ""}
            placeholder={dict.forms.notesPlaceholder}
          />
          <Button type="submit">{dict.roomEdit.submit}</Button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm
            action={handleDelete}
            label={dict.common.delete}
            confirmMessage={dict.roomEdit.deleteConfirm}
          />
        </div>
      </Panel>
    </PageContainer>
  );
}
