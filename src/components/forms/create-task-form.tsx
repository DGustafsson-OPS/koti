"use client";

import { useState } from "react";
import { createTask } from "@/lib/queries";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { Room, Asset } from "@/db/schema";

export function CreateTaskForm({
  propertyId,
  rooms,
  assets,
}: {
  propertyId: string;
  rooms: Room[];
  assets: Asset[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        + Add task
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        const dueDateStr = fd.get("dueDate") as string;
        await createTask({
          propertyId,
          roomId: (fd.get("roomId") as string) || undefined,
          assetId: (fd.get("assetId") as string) || undefined,
          title: fd.get("title") as string,
          description: (fd.get("description") as string) || undefined,
          priority: (fd.get("priority") as string) || "normal",
          skillLevel: (fd.get("skillLevel") as string) || "diy",
          recurrence: (fd.get("recurrence") as string) || "none",
          dueDate: dueDateStr
            ? Math.floor(new Date(dueDateStr).getTime() / 1000)
            : undefined,
        });
        setOpen(false);
      }}
      className="mt-2 p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input label="Title *" name="title" required placeholder="Change HVAC filter" />
      <Textarea label="Description" name="description" />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Priority" name="priority" defaultValue="normal">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </Select>
        <Select label="Recurrence" name="recurrence" defaultValue="none">
          <option value="none">One-time</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </Select>
      </div>
      <Input label="Due date" name="dueDate" type="date" />
      {rooms.length > 0 && (
        <Select label="Room" name="roomId" defaultValue="">
          <option value="">— None —</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      )}
      {assets.length > 0 && (
        <Select label="Asset" name="assetId" defaultValue="">
          <option value="">— None —</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      )}
      <div className="flex gap-2">
        <Button type="submit">Add task</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
