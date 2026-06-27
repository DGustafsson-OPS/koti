"use client";

import { useState } from "react";
import { createMaterial } from "@/lib/queries";
import { Button, Input, Select } from "@/components/ui";
import type { Room } from "@/db/schema";

export function CreateMaterialForm({
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
        + Add material
      </Button>
    );
  }

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
      <Input label="Name *" name="name" required placeholder="Symphony F497" />
      <Select label="Category" name="category" defaultValue="paint">
        <option value="paint">Paint</option>
        <option value="flooring">Flooring</option>
        <option value="tile">Tile</option>
        <option value="filter">Filter</option>
        <option value="hardware">Hardware</option>
        <option value="other">Other</option>
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Brand" name="brand" placeholder="Tikkurila" />
        <Input label="Color code" name="colorCode" placeholder="F497" />
      </div>
      <Input label="Finish" name="finish" placeholder="matte, satin, gloss" />
      <Input label="Leftover location" name="leftoverLocation" placeholder="Garage shelf B" />
      {rooms.length > 0 && (
        <>
          <Select label="Link to room" name="roomId" defaultValue="">
            <option value="">— None —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Input label="Surface" name="surface" placeholder="walls, ceiling, trim, floor" />
        </>
      )}
      <div className="flex gap-2">
        <Button type="submit">Add material</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
