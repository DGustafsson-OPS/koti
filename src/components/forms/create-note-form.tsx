"use client";

import { useState } from "react";
import { createNote } from "@/lib/queries";
import { Button, Textarea } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function CreateNoteForm({ roomId }: { roomId: string }) {
  const { dict } = useI18n();
  const f = dict.forms;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        {f.addNote}
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createNote({
          roomId,
          content: fd.get("content") as string,
        });
        setOpen(false);
      }}
      className="p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Textarea label={f.note} name="content" required placeholder={f.notePlaceholder} />
      <div className="flex gap-2">
        <Button type="submit">{f.saveNote}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
