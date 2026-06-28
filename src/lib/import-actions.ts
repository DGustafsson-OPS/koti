"use server";

import { getRooms, createAsset, createTask } from "@/lib/queries";
import { parseCsv } from "@/lib/csv";
import { dateInputToTimestamp } from "@/lib/date-input";
import { revalidatePath } from "next/cache";

const ASSET_CATEGORIES = new Set([
  "paint",
  "flooring",
  "tile",
  "filter",
  "hardware",
  "appliance",
  "fixture",
  "furniture",
  "system",
  "other",
]);

const TASK_PRIORITIES = new Set(["low", "normal", "urgent"]);

export type ImportResult = {
  created: number;
  errors: string[];
};

function resolveRoomId(roomName: string | undefined, roomByName: Map<string, string>) {
  if (!roomName) return { roomId: undefined as string | undefined };
  const roomId = roomByName.get(roomName.toLowerCase());
  if (!roomId) return { error: `unknown room "${roomName}"` };
  return { roomId };
}

export async function importAssetsFromCsv(
  propertyId: string,
  csvText: string
): Promise<ImportResult> {
  const rooms = await getRooms(propertyId);
  const roomByName = new Map(rooms.map((room) => [room.name.toLowerCase(), room.id]));
  const rows = parseCsv(csvText);

  let created = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name;
    if (!name) {
      errors.push(`Row ${i + 2}: missing name`);
      continue;
    }

    const roomResult = resolveRoomId(row.room, roomByName);
    if (roomResult.error) {
      errors.push(`Row ${i + 2}: ${roomResult.error}`);
      continue;
    }

    const category = (row.category || "other").toLowerCase();
    if (!ASSET_CATEGORIES.has(category)) {
      errors.push(`Row ${i + 2}: invalid category "${row.category}"`);
      continue;
    }

    let purchaseDate: number | undefined;
    if (row.purchase_date) {
      const parsed = Date.parse(row.purchase_date);
      if (Number.isNaN(parsed)) {
        errors.push(`Row ${i + 2}: invalid purchase_date`);
        continue;
      }
      purchaseDate = dateInputToTimestamp(row.purchase_date);
    }

    const purchasePrice = row.purchase_price ? Number(row.purchase_price) : undefined;
    if (row.purchase_price && Number.isNaN(purchasePrice)) {
      errors.push(`Row ${i + 2}: invalid purchase_price`);
      continue;
    }

    await createAsset({
      propertyId,
      roomId: roomResult.roomId,
      name,
      category,
      brand: row.brand || undefined,
      model: row.model || undefined,
      serialNumber: row.serial_number || undefined,
      purchaseDate,
      purchasePrice,
      notes: row.notes || undefined,
    });
    created++;
  }

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}/import`);
  return { created, errors };
}

export async function importTasksFromCsv(
  propertyId: string,
  csvText: string
): Promise<ImportResult> {
  const rooms = await getRooms(propertyId);
  const roomByName = new Map(rooms.map((room) => [room.name.toLowerCase(), room.id]));
  const rows = parseCsv(csvText);

  let created = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = row.title;
    if (!title) {
      errors.push(`Row ${i + 2}: missing title`);
      continue;
    }

    const roomResult = resolveRoomId(row.room, roomByName);
    if (roomResult.error) {
      errors.push(`Row ${i + 2}: ${roomResult.error}`);
      continue;
    }

    const priority = (row.priority || "normal").toLowerCase();
    if (!TASK_PRIORITIES.has(priority)) {
      errors.push(`Row ${i + 2}: invalid priority "${row.priority}"`);
      continue;
    }

    let dueDate: number | undefined;
    if (row.due_date) {
      const parsed = Date.parse(row.due_date);
      if (Number.isNaN(parsed)) {
        errors.push(`Row ${i + 2}: invalid due_date`);
        continue;
      }
      dueDate = dateInputToTimestamp(row.due_date);
    }

    await createTask({
      propertyId,
      roomId: roomResult.roomId,
      title,
      description: row.description || undefined,
      priority,
      dueDate,
    });
    created++;
  }

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/tasks");
  revalidatePath(`/properties/${propertyId}/import`);
  return { created, errors };
}
