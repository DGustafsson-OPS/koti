"use server";

import { db } from "@/db";
import {
  properties,
  rooms,
  materials,
  roomMaterials,
  assets,
  warranties,
  tasks,
  maintenanceEvents,
  notes,
  entityLinks,
} from "@/db/schema";
import { eq, desc, asc, and, lte, gte, or, like, sql } from "drizzle-orm";
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
  name: string;
  floor?: string;
  notes?: string;
}) {
  const id = uuid();
  const ts = now();
  await db.insert(rooms).values({
    id,
    propertyId: data.propertyId,
    name: data.name,
    floor: data.floor ?? null,
    notes: data.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });
  revalidatePath(`/properties/${data.propertyId}`);
  return id;
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

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(propertyId: string) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.propertyId, propertyId), eq(tasks.status, "pending")))
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

export async function getAllHistory(propertyId?: string) {
  if (propertyId) {
    return db
      .select()
      .from(maintenanceEvents)
      .where(eq(maintenanceEvents.propertyId, propertyId))
      .orderBy(desc(maintenanceEvents.completedAt));
  }
  return db.select().from(maintenanceEvents).orderBy(desc(maintenanceEvents.completedAt));
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

export async function searchAll(query: string, propertyId?: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const q = `%${query.trim()}%`;
  const results: SearchResult[] = [];

  const propFilter = propertyId ? eq(properties.id, propertyId) : undefined;

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
      type: "Property",
      id: p.id,
      title: p.name,
      subtitle: p.address ?? "",
      propertyId: p.id,
      href: `/properties/${p.id}`,
    });
  }

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
      type: "Room",
      id: room.id,
      title: room.name,
      subtitle: property.name,
      propertyId: room.propertyId,
      href: `/rooms/${room.id}`,
    });
  }

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
      type: "Material",
      id: m.id,
      title: m.name,
      subtitle: [m.brand, m.colorCode].filter(Boolean).join(" · "),
      propertyId: m.propertyId,
      href: `/properties/${m.propertyId}`,
    });
  }

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
      type: "Asset",
      id: a.id,
      title: a.name,
      subtitle: [a.brand, a.model].filter(Boolean).join(" · "),
      propertyId: a.propertyId,
      href: `/assets/${a.id}`,
    });
  }

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
      type: "Task",
      id: t.id,
      title: t.title,
      subtitle: t.status,
      propertyId: t.propertyId,
      href: `/tasks?property=${t.propertyId}`,
    });
  }

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
      type: "History",
      id: e.id,
      title: e.title,
      subtitle: e.contractor ?? "",
      propertyId: e.propertyId,
      href: `/history?property=${e.propertyId}`,
    });
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
