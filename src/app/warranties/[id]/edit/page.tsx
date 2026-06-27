import { notFound, redirect } from "next/navigation";
import { getWarranty, getAsset, updateWarranty, deleteWarranty } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Textarea, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { dateInputToTimestamp, timestampToDateInput } from "@/lib/date-input";

export default async function EditWarrantyPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const warranty = await getWarranty(id);
  if (!warranty) notFound();

  const asset = await getAsset(warranty.assetId);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateWarranty(id, {
      provider: (formData.get("provider") as string) || undefined,
      expiresAt: dateInputToTimestamp(formData.get("expiresAt") as string),
      terms: (formData.get("terms") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    redirect(`/assets/${warranty!.assetId}`);
  }

  async function handleDelete() {
    "use server";
    await deleteWarranty(id);
    redirect(`/assets/${warranty!.assetId}`);
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.warrantyEdit.title}
        subtitle={dict.warrantyEdit.subtitle}
        back={{ href: `/assets/${warranty.assetId}`, label: asset?.name ?? dict.asset.warranty }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input label={dict.forms.warrantyProvider} name="provider" defaultValue={warranty.provider ?? ""} />
          <Input
            label={dict.forms.warrantyExpires}
            name="expiresAt"
            type="date"
            required
            defaultValue={timestampToDateInput(warranty.expiresAt)}
          />
          <Textarea label={dict.warrantyEdit.terms} name="terms" defaultValue={warranty.terms ?? ""} />
          <Textarea label={dict.forms.notes} name="notes" defaultValue={warranty.notes ?? ""} />
          <Button type="submit">{dict.warrantyEdit.submit}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm action={handleDelete} label={dict.common.delete} confirmMessage={dict.warrantyEdit.deleteConfirm} />
        </div>
      </Panel>
    </PageContainer>
  );
}
