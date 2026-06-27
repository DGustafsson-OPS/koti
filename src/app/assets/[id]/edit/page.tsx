import { notFound, redirect } from "next/navigation";
import { getAsset, getRooms, updateAsset, deleteAsset } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Textarea, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary, categoryLabel } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { dateInputToTimestamp, timestampToDateInput } from "@/lib/date-input";

const CATEGORIES = ["appliance", "fixture", "furniture", "system", "other"] as const;

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const rooms = await getRooms(asset.propertyId);

  async function handleUpdate(formData: FormData) {
    "use server";
    const purchaseDate = formData.get("purchaseDate") as string;
    await updateAsset(id, {
      roomId: (formData.get("roomId") as string) || undefined,
      name: formData.get("name") as string,
      category: (formData.get("category") as string) || "other",
      brand: (formData.get("brand") as string) || undefined,
      model: (formData.get("model") as string) || undefined,
      serialNumber: (formData.get("serialNumber") as string) || undefined,
      purchaseDate: purchaseDate ? dateInputToTimestamp(purchaseDate) : undefined,
      purchasePrice: formData.get("purchasePrice") ? Number(formData.get("purchasePrice")) : undefined,
      replacementValue: formData.get("replacementValue")
        ? Number(formData.get("replacementValue"))
        : undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    redirect(`/assets/${id}`);
  }

  async function handleDelete() {
    "use server";
    await deleteAsset(id);
    redirect(`/properties/${asset!.propertyId}`);
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.assetEdit.title}
        subtitle={dict.assetEdit.subtitle}
        back={{ href: `/assets/${id}`, label: asset.name }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input label={dict.forms.name} name="name" required defaultValue={asset.name} />
          <Select label={dict.forms.category} name="category" defaultValue={asset.category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{categoryLabel(dict, c)}</option>
            ))}
          </Select>
          {rooms.length > 0 && (
            <Select label={dict.forms.room} name="roomId" defaultValue={asset.roomId ?? ""}>
              <option value="">{dict.common.none}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label={dict.forms.brand} name="brand" defaultValue={asset.brand ?? ""} />
            <Input label={dict.forms.model} name="model" defaultValue={asset.model ?? ""} />
          </div>
          <Input label={dict.forms.serialNumber} name="serialNumber" defaultValue={asset.serialNumber ?? ""} />
          <Input
            label={dict.forms.purchaseDate}
            name="purchaseDate"
            type="date"
            defaultValue={timestampToDateInput(asset.purchaseDate)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label={dict.forms.purchasePrice} name="purchasePrice" type="number" defaultValue={asset.purchasePrice ?? undefined} />
            <Input label={dict.forms.replacementValue} name="replacementValue" type="number" defaultValue={asset.replacementValue ?? undefined} />
          </div>
          <Textarea label={dict.forms.notes} name="notes" defaultValue={asset.notes ?? ""} />
          <Button type="submit">{dict.assetEdit.submit}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm action={handleDelete} label={dict.common.delete} confirmMessage={dict.assetEdit.deleteConfirm} />
        </div>
      </Panel>
    </PageContainer>
  );
}
