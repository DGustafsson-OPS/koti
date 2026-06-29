import { getAssets, getRooms, getBuildings, getMaterials, getAllHistory } from "@/lib/queries";
import { db } from "@/db";
import { tasks, roomMaterials } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
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

export async function exportRoomsCsv(propertyId: string) {
  const [roomRows, buildings] = await Promise.all([
    getRooms(propertyId),
    getBuildings(propertyId),
  ]);
  const buildingNames = new Map(buildings.map((building) => [building.id, building.name]));

  const headers = ["name", "building", "floor", "notes"];
  const rows = roomRows.map((room) => [
    room.name,
    room.buildingId ? (buildingNames.get(room.buildingId) ?? "") : "",
    room.floor ?? "",
    room.notes ?? "",
  ]);

  return toCsv(headers, rows);
}

export async function exportMaterialsCsv(propertyId: string) {
  const [materialRows, rooms] = await Promise.all([
    getMaterials(propertyId),
    getRooms(propertyId),
  ]);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
  const materialIds = materialRows.map((material) => material.id);

  const links =
    materialIds.length > 0
      ? await db
          .select()
          .from(roomMaterials)
          .where(inArray(roomMaterials.materialId, materialIds))
      : [];

  const linksByMaterial = new Map<string, typeof links>();
  for (const link of links) {
    const existing = linksByMaterial.get(link.materialId) ?? [];
    existing.push(link);
    linksByMaterial.set(link.materialId, existing);
  }

  const headers = [
    "name",
    "category",
    "brand",
    "color_code",
    "sku",
    "finish",
    "supplier",
    "leftover_location",
    "notes",
    "room",
    "surface",
  ];

  const rows: string[][] = [];
  for (const material of materialRows) {
    const materialLinks = linksByMaterial.get(material.id) ?? [];
    if (materialLinks.length === 0) {
      rows.push([
        material.name,
        material.category,
        material.brand ?? "",
        material.colorCode ?? "",
        material.sku ?? "",
        material.finish ?? "",
        material.supplier ?? "",
        material.leftoverLocation ?? "",
        material.notes ?? "",
        "",
        "",
      ]);
      continue;
    }

    for (const link of materialLinks) {
      rows.push([
        material.name,
        material.category,
        material.brand ?? "",
        material.colorCode ?? "",
        material.sku ?? "",
        material.finish ?? "",
        material.supplier ?? "",
        material.leftoverLocation ?? "",
        material.notes ?? "",
        roomNames.get(link.roomId) ?? "",
        link.surface ?? "",
      ]);
    }
  }

  return toCsv(headers, rows);
}

export async function exportMaintenanceCsv(propertyId: string, year?: number) {
  const [events, rooms] = await Promise.all([
    getAllHistory(propertyId, { year }),
    getRooms(propertyId),
  ]);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));

  const headers = [
    "title",
    "description",
    "completed_date",
    "service_cost",
    "contractor",
    "tax_deductible",
    "room",
    "notes",
  ];

  const rows = events.map((event) => [
    event.title,
    event.description ?? "",
    timestampToDateInput(event.completedAt) ?? "",
    event.cost?.toString() ?? "",
    event.contractor ?? "",
    event.taxDeductible ? "yes" : "no",
    event.roomId ? (roomNames.get(event.roomId) ?? "") : "",
    event.notes ?? "",
  ]);

  return toCsv(headers, rows);
}
