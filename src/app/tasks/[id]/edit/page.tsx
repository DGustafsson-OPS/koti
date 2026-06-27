import { notFound, redirect } from "next/navigation";
import { getTask, getProperty, getRooms, getAssets, updateTask, deleteTask } from "@/lib/queries";
import { PageContainer, PageHeader, Input, Select, Textarea, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary, priorityLabel, recurrenceLabel } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { dateInputToTimestamp, timestampToDateInput } from "@/lib/date-input";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();

  const [property, rooms, assets] = await Promise.all([
    getProperty(task.propertyId),
    getRooms(task.propertyId),
    getAssets(task.propertyId),
  ]);

  async function handleUpdate(formData: FormData) {
    "use server";
    const dueDate = formData.get("dueDate") as string;
    await updateTask(id, {
      roomId: (formData.get("roomId") as string) || undefined,
      assetId: (formData.get("assetId") as string) || undefined,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      priority: (formData.get("priority") as string) || "normal",
      skillLevel: (formData.get("skillLevel") as string) || "diy",
      recurrence: (formData.get("recurrence") as string) || "none",
      dueDate: dueDate ? dateInputToTimestamp(dueDate) : undefined,
    });
    redirect("/tasks");
  }

  async function handleDelete() {
    "use server";
    await deleteTask(id);
    redirect("/tasks");
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.taskEdit.title}
        subtitle={dict.taskEdit.subtitle}
        back={{ href: "/tasks", label: property?.name ?? dict.tasks.title }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Input label={dict.forms.title} name="title" required defaultValue={task.title} />
          <Textarea label={dict.forms.description} name="description" defaultValue={task.description ?? ""} />
          <div className="grid grid-cols-2 gap-3">
            <Select label={dict.forms.priority} name="priority" defaultValue={task.priority}>
              {(["low", "normal", "urgent"] as const).map((p) => (
                <option key={p} value={p}>{priorityLabel(dict, p)}</option>
              ))}
            </Select>
            <Select label={dict.forms.recurrence} name="recurrence" defaultValue={task.recurrence}>
              {(["none", "monthly", "quarterly", "yearly"] as const).map((r) => (
                <option key={r} value={r}>{recurrenceLabel(dict, r)}</option>
              ))}
            </Select>
          </div>
          <Input label={dict.forms.dueDate} name="dueDate" type="date" defaultValue={timestampToDateInput(task.dueDate)} />
          {rooms.length > 0 && (
            <Select label={dict.forms.room} name="roomId" defaultValue={task.roomId ?? ""}>
              <option value="">{dict.common.none}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          )}
          {assets.length > 0 && (
            <Select label={dict.forms.asset} name="assetId" defaultValue={task.assetId ?? ""}>
              <option value="">{dict.common.none}</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          )}
          <Button type="submit">{dict.taskEdit.submit}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm action={handleDelete} label={dict.common.delete} confirmMessage={dict.taskEdit.deleteConfirm} />
        </div>
      </Panel>
    </PageContainer>
  );
}
