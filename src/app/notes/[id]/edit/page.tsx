import { notFound, redirect } from "next/navigation";
import { getNote, getRoom, updateNote, deleteNote } from "@/lib/queries";
import { PageContainer, PageHeader, Textarea, Button, Panel } from "@/components/ui";
import { ConfirmDeleteForm } from "@/components/forms/confirm-delete-form";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const note = await getNote(id);
  if (!note) notFound();

  const room = await getRoom(note.roomId);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateNote(id, { content: formData.get("content") as string });
    redirect(`/rooms/${note!.roomId}`);
  }

  async function handleDelete() {
    "use server";
    await deleteNote(id);
    redirect(`/rooms/${note!.roomId}`);
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        title={dict.noteEdit.title}
        subtitle={dict.noteEdit.subtitle}
        back={{ href: `/rooms/${note.roomId}`, label: room?.name ?? dict.room.notes }}
      />
      <Panel>
        <form action={handleUpdate} className="space-y-4">
          <Textarea label={dict.forms.note} name="content" required defaultValue={note.content} />
          <Button type="submit">{dict.noteEdit.submit}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-stone-100">
          <ConfirmDeleteForm action={handleDelete} label={dict.common.delete} confirmMessage={dict.noteEdit.deleteConfirm} />
        </div>
      </Panel>
    </PageContainer>
  );
}
