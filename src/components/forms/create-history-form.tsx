"use client";

import { useState } from "react";
import { createMaintenanceEvent } from "@/lib/queries";
import { Button, Input, Select, Textarea, FormCheckbox } from "@/components/ui";
import type { Room, Asset } from "@/db/schema";
import { useI18n } from "@/components/locale-provider";
import { parseTaxDeductible } from "@/lib/maintenance-costs";

function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateHistoryForm({
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
        {f.addHistory}
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        const completedDate = fd.get("completedAt") as string;
        await createMaintenanceEvent({
          propertyId,
          title: fd.get("title") as string,
          description: (fd.get("description") as string) || undefined,
          completedAt: Math.floor(new Date(completedDate).getTime() / 1000),
          cost: fd.get("cost") ? Number(fd.get("cost")) : undefined,
          contractor: (fd.get("contractor") as string) || undefined,
          taxDeductible: parseTaxDeductible(fd),
          notes: (fd.get("notes") as string) || undefined,
          roomId: (fd.get("roomId") as string) || undefined,
          assetId: (fd.get("assetId") as string) || undefined,
        });
        setOpen(false);
      }}
      className="p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input
        label={f.title}
        name="title"
        required
        placeholder={f.taskTitlePlaceholder}
      />
      <Textarea label={f.description} name="description" />
      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label={f.completedDate}
          name="completedAt"
          type="date"
          required
          defaultValue={todayDateInputValue()}
        />
        <Input label={f.serviceCost} name="cost" type="number" placeholder="180" />
      </div>
      <Input label={f.contractor} name="contractor" placeholder={dict.tasks.contractorPlaceholder} />
      <FormCheckbox label={f.taxDeductible} name="taxDeductible" />
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
      <Textarea label={f.notes} name="notes" placeholder={dict.tasks.notesPlaceholder} />
      <div className="flex gap-2">
        <Button type="submit">{f.submitHistory}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
