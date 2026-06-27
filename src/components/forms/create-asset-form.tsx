"use client";

import { useState } from "react";
import { createAsset } from "@/lib/queries";
import { Button, Input, Select } from "@/components/ui";
import type { Room } from "@/db/schema";

export function CreateAssetForm({
  propertyId,
  rooms,
}: {
  propertyId: string;
  rooms: Room[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-sm">
        + Add asset
      </Button>
    );
  }

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
          purchasePrice: fd.get("purchasePrice") ? Number(fd.get("purchasePrice")) : undefined,
          replacementValue: fd.get("replacementValue")
            ? Number(fd.get("replacementValue"))
            : undefined,
          warrantyExpiresAt: warrantyDate
            ? Math.floor(new Date(warrantyDate).getTime() / 1000)
            : undefined,
          warrantyProvider: (fd.get("warrantyProvider") as string) || undefined,
        });
        setOpen(false);
      }}
      className="mt-2 p-4 border border-stone-200 rounded-xl space-y-3 bg-stone-50"
    >
      <Input label="Name *" name="name" required placeholder="Bosch Dishwasher" />
      <Select label="Category" name="category" defaultValue="appliance">
        <option value="appliance">Appliance</option>
        <option value="fixture">Fixture</option>
        <option value="furniture">Furniture</option>
        <option value="system">System</option>
        <option value="other">Other</option>
      </Select>
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
      <div className="grid grid-cols-2 gap-3">
        <Input label="Brand" name="brand" />
        <Input label="Model" name="model" />
      </div>
      <Input label="Serial number" name="serialNumber" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Purchase price (€)" name="purchasePrice" type="number" />
        <Input label="Replacement value (€)" name="replacementValue" type="number" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Warranty expires" name="warrantyExpiresAt" type="date" />
        <Input label="Warranty provider" name="warrantyProvider" />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Add asset</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
