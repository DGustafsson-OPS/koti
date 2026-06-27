"use client";

import { useState } from "react";
import { createRoom } from "@/lib/queries";
import { Button, Input } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function CreateRoomForm({ propertyId }: { propertyId: string }) {
  const { dict } = useI18n();
  const f = dict.forms;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        {f.addRoom}
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createRoom({
          propertyId,
          name: fd.get("name") as string,
          floor: (fd.get("floor") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
        });
        setOpen(false);
      }}
      className="mt-2 p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input label={f.roomName} name="name" required placeholder={f.roomNamePlaceholder} />
      <Input label={f.floor} name="floor" placeholder={f.floorPlaceholder} />
      <Input label={f.notes} name="notes" placeholder={f.notesPlaceholder} />
      <div className="flex gap-2">
        <Button type="submit">{f.submitRoom}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
