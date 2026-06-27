"use client";

import { useState } from "react";
import { createWarranty } from "@/lib/queries";
import { Button, Input, Textarea } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";
import { dateInputToTimestamp } from "@/lib/date-input";

export function CreateWarrantyForm({ assetId }: { assetId: string }) {
  const { dict } = useI18n();
  const f = dict.forms;
  const w = dict.warrantyEdit;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        {w.addWarranty}
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        const expiresAt = fd.get("expiresAt") as string;
        await createWarranty({
          assetId,
          provider: (fd.get("provider") as string) || undefined,
          expiresAt: dateInputToTimestamp(expiresAt),
          terms: (fd.get("terms") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
        });
        setOpen(false);
      }}
      className="mt-4 p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input label={f.warrantyProvider} name="provider" />
      <Input label={f.warrantyExpires} name="expiresAt" type="date" required />
      <Textarea label={w.terms} name="terms" />
      <Textarea label={f.notes} name="notes" />
      <div className="flex gap-2">
        <Button type="submit">{w.submitWarranty}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
