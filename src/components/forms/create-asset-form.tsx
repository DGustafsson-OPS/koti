"use client";

import { useState } from "react";
import { createAsset } from "@/lib/queries";
import { Button, Input, Select } from "@/components/ui";
import type { Room } from "@/db/schema";
import { useI18n } from "@/components/locale-provider";
import { categoryLabel } from "@/lib/i18n";

export function CreateAssetForm({
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
        {f.addAsset}
      </Button>
    );
  }

  const categories = ["appliance", "fixture", "furniture", "system", "other"] as const;

  return (
    <form
      action={async (fd) => {
        const warrantyDate = fd.get("warrantyExpiresAt") as string;
        await createAsset({
          propertyId,
          roomId: (fd.get("roomId") as string) || undefined,
          name: fd.get("name") as string,
          category: (fd.get("category") as string) || "other",
          brand: (fd.get("brand") as string) || undefined,
          model: (fd.get("model") as string) || undefined,
          serialNumber: (fd.get("serialNumber") as string) || undefined,
          warrantyExpiresAt: warrantyDate
            ? Math.floor(new Date(warrantyDate).getTime() / 1000)
            : undefined,
          warrantyProvider: (fd.get("warrantyProvider") as string) || undefined,
        });
        setOpen(false);
      }}
      className="mt-2 p-5 border border-stone-200/80 rounded-2xl space-y-4 bg-canvas-subtle/50"
    >
      <Input label={f.name} name="name" required placeholder={f.assetNamePlaceholder} />
      <Select label={f.category} name="category" defaultValue="appliance">
        {categories.map((c) => (
          <option key={c} value={c}>
            {categoryLabel(dict, c)}
          </option>
        ))}
      </Select>
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
      <div className="grid grid-cols-2 gap-3">
        <Input label={f.brand} name="brand" />
        <Input label={f.model} name="model" />
      </div>
      <Input label={f.serialNumber} name="serialNumber" />
      <div className="grid grid-cols-2 gap-3">
        <Input label={f.warrantyExpires} name="warrantyExpiresAt" type="date" />
        <Input label={f.warrantyProvider} name="warrantyProvider" />
      </div>
      <div className="flex gap-2">
        <Button type="submit">{f.submitAsset}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {dict.common.cancel}
        </Button>
      </div>
    </form>
  );
}
