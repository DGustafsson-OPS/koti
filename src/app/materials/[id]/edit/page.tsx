import { notFound, redirect } from "next/navigation";
import { getMaterial, getProperty, updateMaterial, deleteMaterial } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Textarea, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary, categoryLabel } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

const CATEGORIES = ["paint", "flooring", "tile", "filter", "hardware", "other"] as const;

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material) notFound();

  const property = await getProperty(material.propertyId);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateMaterial(id, {
      name: formData.get("name") as string,
      category: (formData.get("category") as string) || "other",
      brand: (formData.get("brand") as string) || undefined,
      colorCode: (formData.get("colorCode") as string) || undefined,
      finish: (formData.get("finish") as string) || undefined,
      supplier: (formData.get("supplier") as string) || undefined,
      leftoverLocation: (formData.get("leftoverLocation") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    redirect(`/properties/${material!.propertyId}`);
  }

  async function handleDelete() {
    "use server";
    await deleteMaterial(id);
    redirect(`/properties/${material!.propertyId}`);
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.materialEdit.title}
        subtitle={dict.materialEdit.subtitle}
        back={{ href: `/properties/${material.propertyId}`, label: property?.name ?? dict.common.property }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input label={dict.forms.name} name="name" required defaultValue={material.name} />
          <Select label={dict.forms.category} name="category" defaultValue={material.category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{categoryLabel(dict, c)}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label={dict.forms.brand} name="brand" defaultValue={material.brand ?? ""} />
            <Input label={dict.forms.colorCode} name="colorCode" defaultValue={material.colorCode ?? ""} />
          </div>
          <Input label={dict.forms.finish} name="finish" defaultValue={material.finish ?? ""} />
          <Input label={dict.forms.leftoverLocation} name="leftoverLocation" defaultValue={material.leftoverLocation ?? ""} />
          <Input label={dict.forms.supplier} name="supplier" defaultValue={material.supplier ?? ""} />
          <Textarea label={dict.forms.notes} name="notes" defaultValue={material.notes ?? ""} />
          <Button type="submit">{dict.materialEdit.submit}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm action={handleDelete} label={dict.common.delete} confirmMessage={dict.materialEdit.deleteConfirm} />
        </div>
      </Panel>
    </PageContainer>
  );
}
