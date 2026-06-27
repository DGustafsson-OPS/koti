import { notFound, redirect } from "next/navigation";
import { getProperty, updateProperty, deleteProperty } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Textarea, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary, propertyTypeLabel } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

const PROPERTY_TYPE_KEYS = ["house", "apartment", "townhouse", "duplex", "other"] as const;

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateProperty(id, {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      propertyType: (formData.get("propertyType") as string) || undefined,
      yearBuilt: formData.get("yearBuilt") ? Number(formData.get("yearBuilt")) : undefined,
      sizeSqm: formData.get("sizeSqm") ? Number(formData.get("sizeSqm")) : undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    redirect(`/properties/${id}`);
  }

  async function handleDelete() {
    "use server";
    await deleteProperty(id);
    redirect("/properties");
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.propertyEdit.title}
        subtitle={dict.propertyEdit.subtitle}
        back={{ href: `/properties/${id}`, label: property.name }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input
            label={dict.propertyNew.name}
            name="name"
            required
            defaultValue={property.name}
            placeholder={dict.propertyNew.namePlaceholder}
          />
          <Input
            label={dict.propertyNew.address}
            name="address"
            defaultValue={property.address ?? ""}
            placeholder={dict.propertyNew.addressPlaceholder}
          />
          <Select
            label={dict.propertyNew.type}
            name="propertyType"
            defaultValue={property.propertyType ?? "house"}
          >
            {PROPERTY_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {propertyTypeLabel(dict, key)}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={dict.propertyNew.yearBuilt}
              name="yearBuilt"
              type="number"
              defaultValue={property.yearBuilt ?? undefined}
              placeholder={dict.propertyNew.yearPlaceholder}
            />
            <Input
              label={dict.propertyNew.size}
              name="sizeSqm"
              type="number"
              defaultValue={property.sizeSqm ?? undefined}
              placeholder={dict.propertyNew.sizePlaceholder}
            />
          </div>
          <Textarea
            label={dict.propertyNew.notes}
            name="notes"
            defaultValue={property.notes ?? ""}
            placeholder={dict.propertyNew.notesPlaceholder}
          />
          <Button type="submit">{dict.propertyEdit.submit}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm
            action={handleDelete}
            label={dict.common.delete}
            confirmMessage={dict.propertyEdit.deleteConfirm}
          />
        </div>
      </Panel>
    </PageContainer>
  );
}
