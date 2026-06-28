"use client";

import { useState } from "react";
import { createContractor } from "@/lib/queries";
import { Button, Input, Textarea } from "@/components/ui";
import { useI18n } from "@/components/locale-provider";

export function CreateContractorForm({ propertyId }: { propertyId: string }) {
  const { dict } = useI18n();
  const f = dict.forms;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        {f.addContractor}
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createContractor({
          propertyId,
          name: fd.get("name") as string,
          specialty: (fd.get("specialty") as string) || undefined,
          phone: (fd.get("phone") as string) || undefined,
          email: (fd.get("email") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
        });
        setOpen(false);
      }}
      className="p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input label={f.name} name="name" required placeholder={f.contractorNamePlaceholder} />
      <Input label={f.specialty} name="specialty" placeholder={f.specialtyPlaceholder} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label={f.phone} name="phone" type="tel" placeholder={f.phonePlaceholder} />
        <Input label={f.email} name="email" type="email" placeholder={f.emailPlaceholder} />
      </div>
      <Textarea label={f.notes} name="notes" placeholder={f.contractorNotesPlaceholder} />
      <div className="flex gap-2">
        <Button type="submit">{f.submitContractor}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
