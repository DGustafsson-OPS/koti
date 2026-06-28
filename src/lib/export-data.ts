import { getAssets, getRooms } from "@/lib/queries";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { toCsv } from "@/lib/csv";
import { timestampToDateInput } from "@/lib/date-input";

export async function exportAssetsCsv(propertyId: string) {
  const [assets, rooms] = await Promise.all([getAssets(propertyId), getRooms(propertyId)]);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));

  const headers = [
    "name",
    "category",
    "brand",
    "model",
    "room",
    "serial_number",
    "purchase_date",
    "purchase_price",
    "notes",
  ];

  const rows = assets.map((asset) => [
    asset.name,
    asset.category,
    asset.brand ?? "",
    asset.model ?? "",
    asset.roomId ? (roomNames.get(asset.roomId) ?? "") : "",
    asset.serialNumber ?? "",
    timestampToDateInput(asset.purchaseDate) ?? "",
    asset.purchasePrice?.toString() ?? "",
    asset.notes ?? "",
  ]);

  return toCsv(headers, rows);
}

export async function exportTasksCsv(propertyId: string) {
  const [taskRows, rooms] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.propertyId, propertyId)).orderBy(asc(tasks.dueDate)),
    getRooms(propertyId),
  ]);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));

  const headers = ["title", "description", "priority", "room", "due_date", "status"];

  const rows = taskRows.map((task) => [
    task.title,
    task.description ?? "",
    task.priority,
    task.roomId ? (roomNames.get(task.roomId) ?? "") : "",
    timestampToDateInput(task.dueDate) ?? "",
    task.status,
  ]);

  return toCsv(headers, rows);
}
