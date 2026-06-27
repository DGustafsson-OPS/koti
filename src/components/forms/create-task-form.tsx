"use client";

import { useState } from "react";
import { createTask } from "@/lib/queries";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { Room, Asset } from "@/db/schema";
import { useI18n } from "@/components/locale-provider";

export function CreateTaskForm({
  propertyId,
  rooms,
  assets,
}: {
  propertyId: string;
  rooms: Room[];
  assets: Asset[];
}) {
  const { dict } = useI18n();
  const f = dict.forms;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        {f.addTask}
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
      <Input label={f.title} name="title" required placeholder={f.taskTitlePlaceholder} />
      <Textarea label={f.description} name="description" />
      <div className="grid grid-cols-2 gap-3">
        <Select label={f.priority} name="priority" defaultValue="normal">
          <option value="low">{dict.priorities.low}</option>
          <option value="normal">{dict.priorities.normal}</option>
          <option value="urgent">{dict.priorities.urgent}</option>
        </Select>
        <Select label={f.recurrence} name="recurrence" defaultValue="none">
          <option value="none">{dict.recurrence.none}</option>
          <option value="monthly">{dict.recurrence.monthly}</option>
          <option value="quarterly">{dict.recurrence.quarterly}</option>
          <option value="yearly">{dict.recurrence.yearly}</option>
        </Select>
      </div>
      <Input label={f.dueDate} name="dueDate" type="date" />
      {rooms.length > 0 && (
        <Select label={f.room} name="roomId" defaultValue="">
          <option value="">{dict.common.none}</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      )}
      {assets.length > 0 && (
        <Select label={f.asset} name="assetId" defaultValue="">
          <option value="">{dict.common.none}</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      )}
      <div className="flex gap-2">
        <Button type="submit">{f.submitTask}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
