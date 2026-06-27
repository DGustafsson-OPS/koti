"use client";

import { useState } from "react";
import { createNote } from "@/lib/queries";
import { Button, Textarea } from "@/components/ui";

export function CreateNoteForm({ roomId }: { roomId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        + Add note
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
      <Textarea label="Note" name="content" required placeholder="Oak parquet — use Bona cleaner only..." />
      <div className="flex gap-2">
        <Button type="submit">Save note</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
