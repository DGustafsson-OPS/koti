import { notFound, redirect } from "next/navigation";
import { getContractor, updateContractor, deleteContractor } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Textarea, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function EditContractorPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const contractor = await getContractor(id);
  if (!contractor) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateContractor(id, {
      name: formData.get("name") as string,
      specialty: (formData.get("specialty") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    });
    redirect("/contractors");
  }

  async function handleDelete() {
    "use server";
    await deleteContractor(id);
    redirect("/contractors");
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.contractorEdit.title}
        subtitle={dict.contractorEdit.subtitle}
        back={{
          href: "/contractors",
          label: dict.contractors.title,
        }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input label={dict.forms.name} name="name" required defaultValue={contractor.name} />
          <Input
            label={dict.forms.specialty}
            name="specialty"
            defaultValue={contractor.specialty ?? ""}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label={dict.forms.phone} name="phone" type="tel" defaultValue={contractor.phone ?? ""} />
            <Input label={dict.forms.email} name="email" type="email" defaultValue={contractor.email ?? ""} />
          </div>
          <Textarea label={dict.forms.notes} name="notes" defaultValue={contractor.notes ?? ""} />
          <Button type="submit">{dict.contractorEdit.submit}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm
            action={handleDelete}
            label={dict.common.delete}
            confirmMessage={dict.contractorEdit.deleteConfirm}
          />
        </div>
      </Panel>
    </PageContainer>
  );
}
