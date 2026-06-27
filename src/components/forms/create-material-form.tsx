"use client";

import { useState } from "react";
import { createMaterial } from "@/lib/queries";
import { Button, Input, Select } from "@/components/ui";
import type { Room } from "@/db/schema";
import { useI18n } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";

export function CreateMaterialForm({
  propertyId,
  rooms,
}: {
  propertyId: string;
  rooms: Room[];
}) {
  const { dict } = useI18n();
  const f = dict.forms;
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        {f.addMaterial}
      </Button>
    );
  }

  const categories = ["paint", "flooring", "tile", "filter", "hardware", "other"] as const;

  return (
    <form
      action={async (fd) => {
        await createMaterial({
          propertyId,
          name: fd.get("name") as string,
          category: (fd.get("category") as string) || "other",
          brand: (fd.get("brand") as string) || undefined,
          colorCode: (fd.get("colorCode") as string) || undefined,
          finish: (fd.get("finish") as string) || undefined,
          supplier: (fd.get("supplier") as string) || undefined,
          leftoverLocation: (fd.get("leftoverLocation") as string) || undefined,
          roomId: (fd.get("roomId") as string) || undefined,
          surface: (fd.get("surface") as string) || undefined,
        });
        setOpen(false);
      }}
      className="mt-2 p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input label={f.name} name="name" required placeholder={f.materialNamePlaceholder} />
      <Select label={f.category} name="category" defaultValue="paint">
        {categories.map((c) => (
          <option key={c} value={c}>
            {categoryLabel(dict, c)}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input label={f.brand} name="brand" placeholder={f.brandPlaceholder} />
        <Input label={f.colorCode} name="colorCode" placeholder={f.colorPlaceholder} />
      </div>
      <Input label={f.finish} name="finish" placeholder={f.finishPlaceholder} />
      <Input label={f.leftoverLocation} name="leftoverLocation" placeholder={f.leftoverPlaceholder} />
      {rooms.length > 0 && (
        <>
          <Select label={f.linkToRoom} name="roomId" defaultValue="">
            <option value="">{dict.common.none}</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Input label={f.surface} name="surface" placeholder={f.surfacePlaceholder} />
        </>
      )}
      <div className="flex gap-2">
        <Button type="submit">{f.submitMaterial}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
