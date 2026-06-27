import { notFound, redirect } from "next/navigation";
import { getBuilding, getProperty, getRooms, updateBuilding, deleteBuilding } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Textarea, Button, Panel, Callout } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary, buildingTypeLabel } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

const BUILDING_TYPE_KEYS = ["main", "garage", "shed", "guest_house", "sauna", "other"] as const;

export default async function EditBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const building = await getBuilding(id);
  if (!building) notFound();

  const [property, buildingRooms] = await Promise.all([
    getProperty(building.propertyId),
    getRooms(building.propertyId).then((rooms) =>
      rooms.filter((r) => r.buildingId === building.id)
    ),
  ]);

  const canDelete = buildingRooms.length === 0;

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateBuilding(id, {
      name: formData.get("name") as string,
      buildingType: (formData.get("buildingType") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    redirect(`/properties/${building!.propertyId}`);
  }

  async function handleDelete() {
    "use server";
    await deleteBuilding(id);
    redirect(`/properties/${building!.propertyId}`);
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.buildingEdit.title}
        subtitle={dict.buildingEdit.subtitle}
        back={{
          href: `/properties/${building.propertyId}`,
          label: property?.name ?? dict.common.property,
        }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input
            label={dict.forms.buildingName}
            name="name"
            required
            defaultValue={building.name}
            placeholder={dict.forms.buildingNamePlaceholder}
          />
          <Select
            label={dict.forms.buildingType}
            name="buildingType"
            defaultValue={building.buildingType ?? "other"}
          >
            {BUILDING_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {buildingTypeLabel(dict, key)}
              </option>
            ))}
          </Select>
          <Textarea
            label={dict.forms.notes}
            name="notes"
            defaultValue={building.notes ?? ""}
            placeholder={dict.forms.buildingNotesPlaceholder}
          />
          <Button type="submit">{dict.buildingEdit.submit}</Button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 space-y-3">
          {!canDelete && (
            <Callout variant="warning">{dict.building.cannotDeleteWithRooms}</Callout>
          )}
          {canDelete && (
            <ConfirmDeleteForm
              action={handleDelete}
              label={dict.common.delete}
              confirmMessage={dict.buildingEdit.deleteConfirm}
            />
          )}
        </div>
      </Panel>
    </PageContainer>
  );
}
