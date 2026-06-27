"use client";

import { useState } from "react";
import { createBuilding } from "@/lib/queries";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { buildingTypeLabel } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";

const BUILDING_TYPE_KEYS = ["main", "garage", "shed", "guest_house", "sauna", "other"] as const;

export function CreateBuildingForm({ propertyId }: { propertyId: string }) {
  const { dict } = useI18n();
  const f = dict.forms;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        {f.addBuilding}
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await createBuilding({
          propertyId,
          name: fd.get("name") as string,
          buildingType: (fd.get("buildingType") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
        });
        setOpen(false);
      }}
      className="mt-4 p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input
        label={f.buildingName}
        name="name"
        required
        placeholder={f.buildingNamePlaceholder}
      />
      <Select label={f.buildingType} name="buildingType" defaultValue="garage">
        {BUILDING_TYPE_KEYS.map((key) => (
          <option key={key} value={key}>
            {buildingTypeLabel(dict, key)}
          </option>
        ))}
      </Select>
      <Textarea label={f.notes} name="notes" placeholder={f.buildingNotesPlaceholder} />
      <div className="flex gap-2">
        <Button type="submit">{f.submitBuilding}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
