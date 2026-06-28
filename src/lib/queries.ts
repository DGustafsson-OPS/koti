"use server";

import { db } from "@/db";
import {
  properties,
  buildings,
  rooms,
  materials,
  roomMaterials,
  assets,
  warranties,
  tasks,
  maintenanceEvents,
  notes,
  entityLinks,
  attachments,
} from "@/db/schema";
import { eq, desc, asc, and, lte, gte, or, like, sql, isNull } from "drizzle-orm";
import { now, nextDueDate } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { revalidatePath } from "next/cache";

// ─── Properties ───────────────────────────────────────────────────────────────

export async function getProperties() {
  return db.select().from(properties).orderBy(asc(properties.name));
}

export async function getProperty(id: string) {
  const [property] = await db.select().from(properties).where(eq(properties.id, id));
  return property ?? null;
}

export async function createProperty(data: {
  name: string;
  address?: string;
  propertyType?: string;
  yearBuilt?: number;
  sizeSqm?: number;
  notes?: string;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(properties).values({
    id,
    name: data.name,
    address: data.address ?? null,
    propertyType: data.propertyType ?? null,
    yearBuilt: data.yearBuilt ?? null,
    sizeSqm: data.sizeSqm ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath("/");
  return id;
}

export async function updateProperty(
  id: string,
  data: {
    name: string;
    address?: string;
    propertyType?: string;
    yearBuilt?: number;
    sizeSqm?: number;
    notes?: string;
  }
) {
  await db
    .update(properties)
    .set({
      name: data.name,
      address: data.address ?? null,
      propertyType: data.propertyType ?? null,
      yearBuilt: data.yearBuilt ?? null,
      sizeSqm: data.sizeSqm ?? null,
      notes: data.notes ?? null,
      updatedAt: now(),
    })
    .where(eq(properties.id, id));
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
}

export async function deleteProperty(id: string) {
  const property = await getProperty(id);
  if (!property) throw new Error("Property not found");

  const { unlink } = await import("fs/promises");
  const { storedFilePath } = await import("@/lib/uploads");
  const files = await db.select().from(attachments).where(eq(attachments.propertyId, id));
  for (const file of files) {
    await unlink(storedFilePath(file.storedName)).catch(() => {});
  }

  await db.delete(properties).where(eq(properties.id, id));
  revalidatePath("/");
  revalidatePath("/properties");
}

// ─── Buildings ──────────────────────────────────────────────────────────────

async function ensureDefaultBuilding(propertyId: string) {
  const existing = await db
    .select()
    .from(buildings)
    .where(eq(buildings.propertyId, propertyId));

  if (existing.length === 0) {
    const id = uuid();
    const ts = now();
    await db.insert(buildings).values({
      id,
      propertyId,
      name: "Main house",
      buildingType: "main",
      createdAt: ts,
      updatedAt: ts,
    });
    await db
      .update(rooms)
      .set({ buildingId: id, updatedAt: ts })
      .where(and(eq(rooms.propertyId, propertyId), isNull(rooms.buildingId)));
    return;
  }

  const orphanRooms = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.propertyId, propertyId), isNull(rooms.buildingId)));

  if (orphanRooms.length > 0) {
    const mainBuilding = existing.find((b) => b.buildingType === "main") ?? existing[0];
    await db
      .update(rooms)
      .set({ buildingId: mainBuilding.id, updatedAt: now() })
      .where(and(eq(rooms.propertyId, propertyId), isNull(rooms.buildingId)));
  }
}

export async function getBuildings(propertyId: string) {
  await ensureDefaultBuilding(propertyId);
  const rows = await db
    .select()
    .from(buildings)
    .where(eq(buildings.propertyId, propertyId))
    .orderBy(asc(buildings.name));
  return rows.sort((a, b) => {
    if (a.buildingType === "main" && b.buildingType !== "main") return -1;
    if (b.buildingType === "main" && a.buildingType !== "main") return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getBuilding(id: string) {
  const [building] = await db.select().from(buildings).where(eq(buildings.id, id));
  return building ?? null;
}

export async function createBuilding(data: {
  propertyId: string;
  name: string;
  buildingType?: string;
  notes?: string;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(buildings).values({
    id,
    propertyId: data.propertyId,
    name: data.name,
    buildingType: data.buildingType ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath(`/properties/${data.propertyId}`);
  return id;
}

export async function updateBuilding(
  id: string,
  data: {
    name: string;
    buildingType?: string;
    notes?: string;
  }
) {
  const building = await getBuilding(id);
  if (!building) throw new Error("Building not found");

  await db
    .update(buildings)
    .set({
      name: data.name,
      buildingType: data.buildingType ?? null,
      notes: data.notes ?? null,
      updatedAt: now(),
    })
    .where(eq(buildings.id, id));
  revalidatePath(`/properties/${building.propertyId}`);
}

export async function deleteBuilding(id: string) {
  const building = await getBuilding(id);
  if (!building) throw new Error("Building not found");

  const [roomCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rooms)
    .where(eq(rooms.buildingId, id));

  if (Number(roomCount?.count ?? 0) > 0) {
    throw new Error("BUILDING_HAS_ROOMS");
  }

  await db.delete(buildings).where(eq(buildings.id, id));
  revalidatePath(`/properties/${building.propertyId}`);
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function getRooms(propertyId: string) {
  return db.select().from(rooms).where(eq(rooms.propertyId, propertyId)).orderBy(asc(rooms.name));
}

export async function getRoom(id: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
  return room ?? null;
}

export async function createRoom(data: {
  propertyId: string;
  buildingId: string;
  name: string;
  floor?: string;
  notes?: string;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(rooms).values({
    id,
    propertyId: data.propertyId,
    buildingId: data.buildingId,
    name: data.name,
    floor: data.floor ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath(`/properties/${data.propertyId}`);
  return id;
}

export async function updateRoom(
  id: string,
  data: {
    buildingId: string;
    name: string;
    floor?: string;
    notes?: string;
  }
) {
  const room = await getRoom(id);
  if (!room) throw new Error("Room not found");

  await db
    .update(rooms)
    .set({
      buildingId: data.buildingId,
      name: data.name,
      floor: data.floor ?? null,
      notes: data.notes ?? null,
      updatedAt: now(),
    })
    .where(eq(rooms.id, id));
  revalidatePath(`/properties/${room.propertyId}`);
  revalidatePath(`/rooms/${id}`);
}

export async function deleteRoom(id: string) {
  const room = await getRoom(id);
  if (!room) throw new Error("Room not found");

  await db.delete(rooms).where(eq(rooms.id, id));
  revalidatePath(`/properties/${room.propertyId}`);
}

export async function getRoomMaterials(roomId: string) {
  return db
    .select({ roomMaterial: roomMaterials, material: materials })
    .from(roomMaterials)
    .innerJoin(materials, eq(roomMaterials.materialId, materials.id))
    .where(eq(roomMaterials.roomId, roomId));
}

export async function getRoomNotes(roomId: string) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.roomId, roomId))
    .orderBy(desc(notes.createdAt));
}

export async function getRoomAssets(roomId: string) {
  return db.select().from(assets).where(eq(assets.roomId, roomId)).orderBy(asc(assets.name));
}

export async function getRoomTasks(roomId: string) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.roomId, roomId), eq(tasks.status, "pending")))
    .orderBy(asc(tasks.dueDate));
}

export async function getRoomHistory(roomId: string) {
  return db
    .select()
    .from(maintenanceEvents)
    .where(eq(maintenanceEvents.roomId, roomId))
    .orderBy(desc(maintenanceEvents.completedAt))
    .limit(10);
}

// ─── Materials ────────────────────────────────────────────────────────────────

export async function getMaterials(propertyId: string) {
  return db
    .select()
    .from(materials)
    .where(eq(materials.propertyId, propertyId))
    .orderBy(asc(materials.name));
}

export async function createMaterial(data: {
  propertyId: string;
  name: string;
  category?: string;
  brand?: string;
  colorCode?: string;
  sku?: string;
  finish?: string;
  supplier?: string;
  leftoverLocation?: string;
  notes?: string;
  roomId?: string;
  surface?: string;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(materials).values({
    id,
    propertyId: data.propertyId,
    name: data.name,
    category: data.category ?? "other",
    brand: data.brand ?? null,
    colorCode: data.colorCode ?? null,
    sku: data.sku ?? null,
    finish: data.finish ?? null,
    supplier: data.supplier ?? null,
    leftoverLocation: data.leftoverLocation ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });

  if (data.roomId) {
    await db.insert(roomMaterials).values({
      id: uuid(),
      roomId: data.roomId,
      materialId: id,
      surface: data.surface ?? null,
      appliedAt: ts,
    });
    await db.insert(entityLinks).values({
      id: uuid(),
      propertyId: data.propertyId,
      sourceType: "room",
      sourceId: data.roomId,
      targetType: "material",
      targetId: id,
      relationship: "uses",
      createdAt: ts,
    });
  }

  revalidatePath(`/properties/${data.propertyId}`);
  return id;
}

export async function getMaterial(id: string) {
  const [material] = await db.select().from(materials).where(eq(materials.id, id));
  return material ?? null;
}

export async function updateMaterial(
  id: string,
  data: {
    name: string;
    category?: string;
    brand?: string;
    colorCode?: string;
    sku?: string;
    finish?: string;
    supplier?: string;
    leftoverLocation?: string;
    notes?: string;
  }
) {
  const material = await getMaterial(id);
  if (!material) throw new Error("Material not found");

  await db
    .update(materials)
    .set({
      name: data.name,
      category: data.category ?? "other",
      brand: data.brand ?? null,
      colorCode: data.colorCode ?? null,
      sku: data.sku ?? null,
      finish: data.finish ?? null,
      supplier: data.supplier ?? null,
      leftoverLocation: data.leftoverLocation ?? null,
      notes: data.notes ?? null,
      updatedAt: now(),
    })
    .where(eq(materials.id, id));
  revalidatePath(`/properties/${material.propertyId}`);
}

export async function deleteMaterial(id: string) {
  const material = await getMaterial(id);
  if (!material) throw new Error("Material not found");
  await db.delete(materials).where(eq(materials.id, id));
  revalidatePath(`/properties/${material.propertyId}`);
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export async function getAssets(propertyId: string) {
  return db.select().from(assets).where(eq(assets.propertyId, propertyId)).orderBy(asc(assets.name));
}

export async function getAsset(id: string) {
  const [asset] = await db.select().from(assets).where(eq(assets.id, id));
  return asset ?? null;
}

export async function getAssetWarranties(assetId: string) {
  return db
    .select()
    .from(warranties)
    .where(eq(warranties.assetId, assetId))
    .orderBy(asc(warranties.expiresAt));
}

export async function createAsset(data: {
  propertyId: string;
  roomId?: string;
  name: string;
  category?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: number;
  purchasePrice?: number;
  replacementValue?: number;
  notes?: string;
  warrantyExpiresAt?: number;
  warrantyProvider?: string;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(assets).values({
    id,
    propertyId: data.propertyId,
    roomId: data.roomId ?? null,
    name: data.name,
    category: data.category ?? "other",
    brand: data.brand ?? null,
    model: data.model ?? null,
    serialNumber: data.serialNumber ?? null,
    purchaseDate: data.purchaseDate ?? null,
    purchasePrice: data.purchasePrice ?? null,
    replacementValue: data.replacementValue ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });

  if (data.warrantyExpiresAt) {
    const warrantyId = uuid();
    await db.insert(warranties).values({
      id: warrantyId,
      assetId: id,
      provider: data.warrantyProvider ?? null,
      expiresAt: data.warrantyExpiresAt,
      createdAt: ts,
    });
    await db.insert(entityLinks).values({
      id: uuid(),
      propertyId: data.propertyId,
      sourceType: "asset",
      sourceId: id,
      targetType: "warranty",
      targetId: warrantyId,
      relationship: "has_warranty",
      createdAt: ts,
    });
  }

  revalidatePath(`/properties/${data.propertyId}`);
  return id;
}

export async function updateAsset(
  id: string,
  data: {
    roomId?: string;
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: number;
    purchasePrice?: number;
    replacementValue?: number;
    notes?: string;
  }
) {
  const asset = await getAsset(id);
  if (!asset) throw new Error("Asset not found");

  await db
    .update(assets)
    .set({
      roomId: data.roomId ?? null,
      name: data.name,
      category: data.category ?? "other",
      brand: data.brand ?? null,
      model: data.model ?? null,
      serialNumber: data.serialNumber ?? null,
      purchaseDate: data.purchaseDate ?? null,
      purchasePrice: data.purchasePrice ?? null,
      replacementValue: data.replacementValue ?? null,
      notes: data.notes ?? null,
      updatedAt: now(),
    })
    .where(eq(assets.id, id));
  revalidatePath("/");
  revalidatePath(`/properties/${asset.propertyId}`);
  revalidatePath(`/assets/${id}`);
}

export async function deleteAsset(id: string) {
  const asset = await getAsset(id);
  if (!asset) throw new Error("Asset not found");
  await db.delete(assets).where(eq(assets.id, id));
  revalidatePath("/");
  revalidatePath(`/properties/${asset.propertyId}`);
}

export async function getWarranty(id: string) {
  const [warranty] = await db.select().from(warranties).where(eq(warranties.id, id));
  return warranty ?? null;
}

export async function createWarranty(data: {
  assetId: string;
  provider?: string;
  expiresAt: number;
  terms?: string;
  notes?: string;
}) {
  const asset = await getAsset(data.assetId);
  if (!asset) throw new Error("Asset not found");

  const id = uuid();
  const ts = now();
  await db.insert(warranties).values({
    id,
    assetId: data.assetId,
    provider: data.provider ?? null,
    expiresAt: data.expiresAt,
    terms: data.terms ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
  });
  revalidatePath(`/assets/${data.assetId}`);
  revalidatePath("/");
  return id;
}

export async function updateWarranty(
  id: string,
  data: {
    provider?: string;
    expiresAt: number;
    terms?: string;
    notes?: string;
  }
) {
  const warranty = await getWarranty(id);
  if (!warranty) throw new Error("Warranty not found");

  await db
    .update(warranties)
    .set({
      provider: data.provider ?? null,
      expiresAt: data.expiresAt,
      terms: data.terms ?? null,
      notes: data.notes ?? null,
    })
    .where(eq(warranties.id, id));
  revalidatePath(`/assets/${warranty.assetId}`);
  revalidatePath("/");
}

export async function deleteWarranty(id: string) {
  const warranty = await getWarranty(id);
  if (!warranty) throw new Error("Warranty not found");
  await db.delete(warranties).where(eq(warranties.id, id));
  revalidatePath(`/assets/${warranty.assetId}`);
  revalidatePath("/");
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(
  propertyId: string,
  filter: "all" | "overdue" | "month" = "all"
) {
  const ts = now();
  const conditions = [eq(tasks.propertyId, propertyId), eq(tasks.status, "pending")];

  if (filter === "overdue") {
    conditions.push(lte(tasks.dueDate, ts));
  } else if (filter === "month") {
    conditions.push(gte(tasks.dueDate, ts));
    conditions.push(lte(tasks.dueDate, ts + 30 * 86400));
  }

  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.dueDate));
}

export async function getOverdueTasks(propertyId?: string) {
  const ts = now();
  const conditions = [eq(tasks.status, "pending"), lte(tasks.dueDate, ts)];
  if (propertyId) conditions.push(eq(tasks.propertyId, propertyId));
  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.dueDate));
}

export async function getUpcomingTasks(propertyId?: string, days = 30) {
  const ts = now();
  const future = ts + days * 86400;
  const conditions = [
    eq(tasks.status, "pending"),
    gte(tasks.dueDate, ts),
    lte(tasks.dueDate, future),
  ];
  if (propertyId) conditions.push(eq(tasks.propertyId, propertyId));
  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.dueDate));
}

export async function createTask(data: {
  propertyId: string;
  roomId?: string;
  assetId?: string;
  title: string;
  description?: string;
  priority?: string;
  skillLevel?: string;
  recurrence?: string;
  recurrenceIntervalDays?: number;
  dueDate?: number;
  estimatedCost?: number;
  estimatedMinutes?: number;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(tasks).values({
    id,
    propertyId: data.propertyId,
    roomId: data.roomId ?? null,
    assetId: data.assetId ?? null,
    title: data.title,
    description: data.description ?? null,
    priority: data.priority ?? "normal",
    skillLevel: data.skillLevel ?? "diy",
    recurrence: data.recurrence ?? "none",
    recurrenceIntervalDays: data.recurrenceIntervalDays ?? null,
    dueDate: data.dueDate ?? null,
    estimatedCost: data.estimatedCost ?? null,
    estimatedMinutes: data.estimatedMinutes ?? null,
    status: "pending",
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath("/");
  revalidatePath(`/properties/${data.propertyId}`);
  return id;
}

export async function getTask(id: string) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  return task ?? null;
}

export async function updateTask(
  id: string,
  data: {
    roomId?: string;
    assetId?: string;
    title: string;
    description?: string;
    priority?: string;
    skillLevel?: string;
    recurrence?: string;
    recurrenceIntervalDays?: number;
    dueDate?: number;
    estimatedCost?: number;
    estimatedMinutes?: number;
  }
) {
  const task = await getTask(id);
  if (!task) throw new Error("Task not found");

  await db
    .update(tasks)
    .set({
      roomId: data.roomId ?? null,
      assetId: data.assetId ?? null,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? "normal",
      skillLevel: data.skillLevel ?? "diy",
      recurrence: data.recurrence ?? "none",
      recurrenceIntervalDays: data.recurrenceIntervalDays ?? null,
      dueDate: data.dueDate ?? null,
      estimatedCost: data.estimatedCost ?? null,
      estimatedMinutes: data.estimatedMinutes ?? null,
      updatedAt: now(),
    })
    .where(eq(tasks.id, id));
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/properties/${task.propertyId}`);
}

export async function deleteTask(id: string) {
  const task = await getTask(id);
  if (!task) throw new Error("Task not found");
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/properties/${task.propertyId}`);
}

export async function completeTask(data: {
  taskId: string;
  cost?: number;
  contractor?: string;
  notes?: string;
}) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, data.taskId));
  if (!task) throw new Error("Task not found");

  const ts = now();
  const eventId = uuid();

  await db.insert(maintenanceEvents).values({
    id: eventId,
    propertyId: task.propertyId,
    taskId: task.id,
    roomId: task.roomId,
    assetId: task.assetId,
    title: task.title,
    description: task.description,
    completedAt: ts,
    cost: data.cost ?? null,
    contractor: data.contractor ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
  });

  await db.insert(entityLinks).values({
    id: uuid(),
    propertyId: task.propertyId,
    sourceType: "event",
    sourceId: eventId,
    targetType: "task",
    targetId: task.id,
    relationship: "completed",
    createdAt: ts,
  });

  if (task.recurrence !== "none") {
    const nextDue = nextDueDate(task.recurrence, task.recurrenceIntervalDays, ts);
    await db
      .update(tasks)
      .set({ dueDate: nextDue, updatedAt: ts })
      .where(eq(tasks.id, task.id));
  } else {
    await db.update(tasks).set({ status: "completed", updatedAt: ts }).where(eq(tasks.id, task.id));
  }

  revalidatePath("/");
  revalidatePath(`/properties/${task.propertyId}`);
  return eventId;
}

export async function createMaintenanceEvent(data: {
  propertyId: string;
  title: string;
  description?: string;
  completedAt: number;
  cost?: number;
  contractor?: string;
  notes?: string;
  roomId?: string;
  assetId?: string;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(maintenanceEvents).values({
    id,
    propertyId: data.propertyId,
    taskId: null,
    roomId: data.roomId ?? null,
    assetId: data.assetId ?? null,
    title: data.title,
    description: data.description ?? null,
    completedAt: data.completedAt,
    cost: data.cost ?? null,
    contractor: data.contractor ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
  });
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/properties/${data.propertyId}`);
  if (data.roomId) revalidatePath(`/rooms/${data.roomId}`);
  return id;
}

export async function getMaintenanceEvent(id: string) {
  const [event] = await db.select().from(maintenanceEvents).where(eq(maintenanceEvents.id, id));
  return event ?? null;
}

export async function updateMaintenanceEvent(
  id: string,
  data: {
    title: string;
    description?: string;
    completedAt: number;
    cost?: number;
    contractor?: string;
    notes?: string;
    roomId?: string;
    assetId?: string;
  }
) {
  const event = await getMaintenanceEvent(id);
  if (!event) throw new Error("Event not found");

  await db
    .update(maintenanceEvents)
    .set({
      title: data.title,
      description: data.description ?? null,
      completedAt: data.completedAt,
      cost: data.cost ?? null,
      contractor: data.contractor ?? null,
      notes: data.notes ?? null,
      roomId: data.roomId ?? null,
      assetId: data.assetId ?? null,
    })
    .where(eq(maintenanceEvents.id, id));
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/properties/${event.propertyId}`);
}

export async function deleteMaintenanceEvent(id: string) {
  const event = await getMaintenanceEvent(id);
  if (!event) throw new Error("Event not found");
  await db.delete(maintenanceEvents).where(eq(maintenanceEvents.id, id));
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/properties/${event.propertyId}`);
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getRecentHistory(propertyId?: string, limit = 10) {
  const query = db
    .select()
    .from(maintenanceEvents)
    .orderBy(desc(maintenanceEvents.completedAt))
    .limit(limit);

  if (propertyId) {
    return db
      .select()
      .from(maintenanceEvents)
      .where(eq(maintenanceEvents.propertyId, propertyId))
      .orderBy(desc(maintenanceEvents.completedAt))
      .limit(limit);
  }
  return query;
}

export async function getAllHistory(
  propertyId?: string,
  filters?: { roomId?: string; contractor?: string }
) {
  const conditions = [];
  if (propertyId) conditions.push(eq(maintenanceEvents.propertyId, propertyId));
  if (filters?.roomId) conditions.push(eq(maintenanceEvents.roomId, filters.roomId));
  if (filters?.contractor) {
    conditions.push(like(maintenanceEvents.contractor, `%${filters.contractor}%`));
  }

  if (conditions.length === 0) {
    return db.select().from(maintenanceEvents).orderBy(desc(maintenanceEvents.completedAt));
  }

  return db
    .select()
    .from(maintenanceEvents)
    .where(and(...conditions))
    .orderBy(desc(maintenanceEvents.completedAt));
}

// ─── Warranties ───────────────────────────────────────────────────────────────

export async function getExpiringWarranties(propertyId?: string, withinDays = 60) {
  const ts = now();
  const deadline = ts + withinDays * 86400;
  const rows = await db
    .select({ warranty: warranties, asset: assets })
    .from(warranties)
    .innerJoin(assets, eq(warranties.assetId, assets.id))
    .where(and(gte(warranties.expiresAt, ts), lte(warranties.expiresAt, deadline)))
    .orderBy(asc(warranties.expiresAt));

  if (propertyId) {
    return rows.filter((r) => r.asset.propertyId === propertyId);
  }
  return rows;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getInventoryValue(propertyId: string) {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${assets.replacementValue}), 0)` })
    .from(assets)
    .where(eq(assets.propertyId, propertyId));
  return result?.total ?? 0;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  propertyId: string;
  href: string;
};

export async function searchAll(
  query: string,
  propertyId?: string,
  type?: string
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const q = `%${query.trim()}%`;
  const results: SearchResult[] = [];
  const include = (key: string) => !type || type === key;

  const propFilter = propertyId ? eq(properties.id, propertyId) : undefined;

  if (include("property")) {
    const propRows = await db
      .select()
      .from(properties)
      .where(
        propFilter
          ? and(propFilter, or(like(properties.name, q), like(properties.address, q)))
          : or(like(properties.name, q), like(properties.address, q))
      );
    for (const p of propRows) {
      results.push({
        type: "property",
        id: p.id,
        title: p.name,
        subtitle: p.address ?? "",
        propertyId: p.id,
        href: `/properties/${p.id}`,
      });
    }
  }

  if (include("room")) {
    const roomRows = await db
      .select({ room: rooms, property: properties })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(
        propertyId
          ? and(eq(rooms.propertyId, propertyId), or(like(rooms.name, q), like(rooms.notes, q)))
          : or(like(rooms.name, q), like(rooms.notes, q))
      );
    for (const { room, property } of roomRows) {
      results.push({
        type: "room",
        id: room.id,
        title: room.name,
        subtitle: property.name,
        propertyId: room.propertyId,
        href: `/rooms/${room.id}`,
      });
    }
  }

  if (include("material")) {
    const matRows = await db
      .select()
      .from(materials)
      .where(
        propertyId
          ? and(
              eq(materials.propertyId, propertyId),
              or(
                like(materials.name, q),
                like(materials.brand, q),
                like(materials.colorCode, q),
                like(materials.sku, q)
              )
            )
          : or(
              like(materials.name, q),
              like(materials.brand, q),
              like(materials.colorCode, q),
              like(materials.sku, q)
            )
      );
    for (const m of matRows) {
      results.push({
        type: "material",
        id: m.id,
        title: m.name,
        subtitle: [m.brand, m.colorCode].filter(Boolean).join(" · "),
        propertyId: m.propertyId,
        href: `/materials/${m.id}/edit`,
      });
    }
  }

  if (include("asset")) {
    const assetRows = await db
      .select()
      .from(assets)
      .where(
        propertyId
          ? and(
              eq(assets.propertyId, propertyId),
              or(
                like(assets.name, q),
                like(assets.brand, q),
                like(assets.model, q),
                like(assets.serialNumber, q)
              )
            )
          : or(
              like(assets.name, q),
              like(assets.brand, q),
              like(assets.model, q),
              like(assets.serialNumber, q)
            )
      );
    for (const a of assetRows) {
      results.push({
        type: "asset",
        id: a.id,
        title: a.name,
        subtitle: [a.brand, a.model].filter(Boolean).join(" · "),
        propertyId: a.propertyId,
        href: `/assets/${a.id}`,
      });
    }
  }

  if (include("task")) {
    const taskRows = await db
      .select()
      .from(tasks)
      .where(
        propertyId
          ? and(
              eq(tasks.propertyId, propertyId),
              or(like(tasks.title, q), like(tasks.description, q))
            )
          : or(like(tasks.title, q), like(tasks.description, q))
      );
    for (const t of taskRows) {
      results.push({
        type: "task",
        id: t.id,
        title: t.title,
        subtitle: t.status,
        propertyId: t.propertyId,
        href: `/tasks/${t.id}/edit`,
      });
    }
  }

  if (include("event")) {
    const eventRows = await db
      .select()
      .from(maintenanceEvents)
      .where(
        propertyId
          ? and(
              eq(maintenanceEvents.propertyId, propertyId),
              or(
                like(maintenanceEvents.title, q),
                like(maintenanceEvents.contractor, q),
                like(maintenanceEvents.notes, q)
              )
            )
          : or(
              like(maintenanceEvents.title, q),
              like(maintenanceEvents.contractor, q),
              like(maintenanceEvents.notes, q)
            )
      );
    for (const e of eventRows) {
      results.push({
        type: "event",
        id: e.id,
        title: e.title,
        subtitle: e.contractor ?? "",
        propertyId: e.propertyId,
        href: `/events/${e.id}/edit`,
      });
    }
  }

  if (include("file")) {
    const fileRows = await db
      .select()
      .from(attachments)
      .where(
        propertyId
          ? and(eq(attachments.propertyId, propertyId), like(attachments.filename, q))
          : like(attachments.filename, q)
      );
    for (const file of fileRows) {
      results.push({
        type: "file",
        id: file.id,
        title: file.filename,
        subtitle: file.entityType,
        propertyId: file.propertyId,
        href: `/api/files/${file.id}`,
      });
    }
  }

  return results;
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function createNote(data: { roomId: string; content: string }) {
  const room = await getRoom(data.roomId);
  if (!room) throw new Error("Room not found");
  const id = uuid();
  const ts = now();
  await db.insert(notes).values({
    id,
    roomId: data.roomId,
    content: data.content,
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath(`/rooms/${data.roomId}`);
  return id;
}

export async function getNote(id: string) {
  const [note] = await db.select().from(notes).where(eq(notes.id, id));
  return note ?? null;
}

export async function updateNote(id: string, data: { content: string }) {
  const note = await getNote(id);
  if (!note) throw new Error("Note not found");

  await db
    .update(notes)
    .set({ content: data.content, updatedAt: now() })
    .where(eq(notes.id, id));
  revalidatePath(`/rooms/${note.roomId}`);
}

export async function deleteNote(id: string) {
  const note = await getNote(id);
  if (!note) throw new Error("Note not found");
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath(`/rooms/${note.roomId}`);
}

// ─── Attachments ──────────────────────────────────────────────────────────────

export async function getAttachments(entityType: string, entityId: string) {
  return db
    .select()
    .from(attachments)
    .where(and(eq(attachments.entityType, entityType), eq(attachments.entityId, entityId)))
    .orderBy(desc(attachments.createdAt));
}

export async function getAttachment(id: string) {
  const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
  return attachment ?? null;
}

export async function createAttachment(data: {
  propertyId: string;
  entityType: string;
  entityId: string;
  filename: string;
  storedName: string;
  mimeType?: string;
  sizeBytes?: number;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(attachments).values({
    id,
    propertyId: data.propertyId,
    entityType: data.entityType,
    entityId: data.entityId,
    filename: data.filename,
    storedName: data.storedName,
    mimeType: data.mimeType ?? null,
    sizeBytes: data.sizeBytes ?? null,
    createdAt: ts,
  });
  revalidateAttachmentPaths(data.entityType, data.entityId);
  return id;
}

export async function deleteAttachmentRecord(id: string) {
  const attachment = await getAttachment(id);
  if (!attachment) throw new Error("Attachment not found");
  await db.delete(attachments).where(eq(attachments.id, id));
  revalidateAttachmentPaths(attachment.entityType, attachment.entityId);
  return attachment;
}

function revalidateAttachmentPaths(entityType: string, entityId: string) {
  if (entityType === "room") revalidatePath(`/rooms/${entityId}`);
  if (entityType === "asset") revalidatePath(`/assets/${entityId}`);
  if (entityType === "event") revalidatePath(`/events/${entityId}/edit`);
  if (entityType === "property") revalidatePath(`/properties/${entityId}`);
}
