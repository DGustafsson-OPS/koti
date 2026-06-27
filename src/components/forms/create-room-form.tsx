"use client";

import { useState } from "react";
import { createRoom } from "@/lib/queries";
import { Button, Input } from "@/components/ui";

export function CreateRoomForm({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        + Add room
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
      <Input label="Room name *" name="name" required placeholder="Living Room" />
      <Input label="Floor" name="floor" placeholder="Ground, 1st, Basement" />
      <Input label="Notes" name="notes" placeholder="Optional notes" />
      <div className="flex gap-2">
        <Button type="submit">Add room</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
