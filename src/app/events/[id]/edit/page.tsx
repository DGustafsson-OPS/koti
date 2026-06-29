import { notFound, redirect } from "next/navigation";
import {
  getMaintenanceEvent,
  getProperty,
  getRooms,
  getAssets,
  getAttachments,
  getContractors,
  updateMaintenanceEvent,
  deleteMaintenanceEvent,
} from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Textarea, Button, Panel, Section, FormCheckbox } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { AttachmentsSection } from "@/components/attachments-section";
import { ContractorField } from "@/components/forms/contractor-field";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { dateInputToTimestamp, timestampToDateInput } from "@/lib/date-input";
import { parseTaxDeductible } from "@/lib/maintenance-costs";
import { parseContractorForm } from "@/lib/contractors";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const event = await getMaintenanceEvent(id);
  if (!event) notFound();

  const [property, rooms, assets, attachments, propertyContractors] = await Promise.all([
    getProperty(event.propertyId),
    getRooms(event.propertyId),
    getAssets(event.propertyId),
    getAttachments("event", id),
    getContractors(),
  ]);

  async function handleUpdate(formData: FormData) {
    "use server";
    const contractorInput = parseContractorForm(formData);
    await updateMaintenanceEvent(id, {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      completedAt: dateInputToTimestamp(formData.get("completedAt") as string),
      cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
      ...contractorInput,
      taxDeductible: parseTaxDeductible(formData),
      notes: (formData.get("notes") as string) || undefined,
      roomId: (formData.get("roomId") as string) || undefined,
      assetId: (formData.get("assetId") as string) || undefined,
    });
    redirect("/history");
  }

  async function handleDelete() {
    "use server";
    await deleteMaintenanceEvent(id);
    redirect("/history");
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.eventEdit.title}
        subtitle={dict.eventEdit.subtitle}
        back={{ href: "/history", label: property?.name ?? dict.history.title }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input label={dict.forms.title} name="title" required defaultValue={event.title} />
          <Textarea label={dict.forms.description} name="description" defaultValue={event.description ?? ""} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={dict.forms.completedDate}
              name="completedAt"
              type="date"
              required
              defaultValue={timestampToDateInput(event.completedAt)}
            />
            <Input
              label={dict.forms.serviceCost}
              name="cost"
              type="number"
              defaultValue={event.cost ?? undefined}
            />
          </div>
          <ContractorField
            contractors={propertyContractors}
            defaultContractorId={event.contractorId}
            defaultContractorName={event.contractor}
          />
          <FormCheckbox
            label={dict.forms.taxDeductible}
            name="taxDeductible"
            defaultChecked={event.taxDeductible}
          />
          {rooms.length > 0 && (
            <Select label={dict.forms.room} name="roomId" defaultValue={event.roomId ?? ""}>
              <option value="">{dict.common.none}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          )}
          {assets.length > 0 && (
            <Select label={dict.forms.asset} name="assetId" defaultValue={event.assetId ?? ""}>
              <option value="">{dict.common.none}</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          )}
          <Textarea label={dict.forms.notes} name="notes" defaultValue={event.notes ?? ""} />
          <Button type="submit">{dict.eventEdit.submit}</Button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100">
          <Section title={dict.attachments.title}>
            <AttachmentsSection
              propertyId={event.propertyId}
              entityType="event"
              entityId={id}
              attachments={attachments}
              locale={locale}
            />
          </Section>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm action={handleDelete} label={dict.common.delete} confirmMessage={dict.eventEdit.deleteConfirm} />
        </div>
      </Panel>
    </PageContainer>
  );
}
