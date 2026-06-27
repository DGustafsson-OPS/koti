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
} from "@/db/schema";
import { v4 as uuid } from "uuid";

function ts(offsetDays = 0): number {
  return Math.floor(Date.now() / 1000) + offsetDays * 86400;
}

async function seed() {
  const propertyId = uuid();
  const now = ts();

  await db.insert(properties).values({
    id: propertyId,
    name: "Main Home",
    address: "12 Birch Lane, Helsinki",
    propertyType: "house",
    yearBuilt: 1985,
    sizeSqm: 145,
    notes: "Water shutoff: utility room, left wall. Breaker panel: garage.",
    createdAt: now,
    updatedAt: now,
  });

  const mainBuildingId = uuid();
  const garageBuildingId = uuid();

  await db.insert(buildings).values([
    {
      id: mainBuildingId,
      propertyId,
      name: "Main house",
      buildingType: "main",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: garageBuildingId,
      propertyId,
      name: "Attached garage",
      buildingType: "garage",
      notes: "Breaker panel on east wall",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const roomIds = {
    living: uuid(),
    kitchen: uuid(),
    bathroom: uuid(),
    bedroom: uuid(),
    utility: uuid(),
    garage: uuid(),
  };

  for (const [key, id] of Object.entries(roomIds)) {
    const names: Record<string, { name: string; floor: string; notes: string; buildingId: string }> = {
      living: { name: "Living Room", floor: "Ground", notes: "South-facing, oak parquet floor", buildingId: mainBuildingId },
      kitchen: { name: "Kitchen", floor: "Ground", notes: "Renovated 2022", buildingId: mainBuildingId },
      bathroom: { name: "Bathroom", floor: "Ground", notes: "Main bathroom", buildingId: mainBuildingId },
      bedroom: { name: "Master Bedroom", floor: "1st", notes: "", buildingId: mainBuildingId },
      utility: { name: "Utility Room", floor: "Ground", notes: "Boiler and laundry", buildingId: mainBuildingId },
      garage: { name: "Garage", floor: "Ground", notes: "Two-car, workshop corner", buildingId: garageBuildingId },
    };
    const r = names[key];
    await db.insert(rooms).values({
      id,
      propertyId,
      buildingId: r.buildingId,
      name: r.name,
      floor: r.floor,
      notes: r.notes,
      createdAt: now,
      updatedAt: now,
    });
  }

  const paintId = uuid();
  await db.insert(materials).values({
    id: paintId,
    propertyId,
    name: "Symphony F497",
    category: "paint",
    brand: "Tikkurila",
    colorCode: "F497",
    finish: "matte",
    supplier: "K-Rauta",
    leftoverLocation: "Garage shelf B — 2.5L can",
    notes: "Hallway and stairwell white",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(roomMaterials).values({
    id: uuid(),
    roomId: roomIds.living,
    materialId: paintId,
    surface: "walls",
    appliedAt: ts(-365),
  });

  const boilerId = uuid();
  await db.insert(assets).values({
    id: boilerId,
    propertyId,
    roomId: roomIds.utility,
    name: "Vaillant Boiler",
    category: "system",
    brand: "Vaillant",
    model: "ecoTEC plus",
    serialNumber: "VT-2019-44821",
    purchaseDate: ts(-365 * 4),
    purchasePrice: 3200,
    replacementValue: 4500,
    notes: "Annual service required",
    createdAt: now,
    updatedAt: now,
  });

  const warrantyId = uuid();
  await db.insert(warranties).values({
    id: warrantyId,
    assetId: boilerId,
    provider: "Vaillant",
    expiresAt: ts(45),
    terms: "5-year manufacturer warranty",
    createdAt: now,
  });

  const dishwasherId = uuid();
  await db.insert(assets).values({
    id: dishwasherId,
    propertyId,
    roomId: roomIds.kitchen,
    name: "Bosch Dishwasher",
    category: "appliance",
    brand: "Bosch",
    model: "SMS6ZCI00E",
    serialNumber: "BS-2022-99102",
    purchaseDate: ts(-365 * 2),
    purchasePrice: 680,
    replacementValue: 750,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(warranties).values({
    id: uuid(),
    assetId: dishwasherId,
    provider: "Bosch",
    expiresAt: ts(20),
    createdAt: now,
  });

  const taskDefs = [
    {
      title: "Change HVAC filter",
      roomId: roomIds.utility,
      recurrence: "quarterly",
      dueDate: ts(-5),
      priority: "normal",
    },
    {
      title: "Clean gutters",
      recurrence: "yearly",
      dueDate: ts(14),
      priority: "normal",
    },
    {
      title: "Test smoke alarms",
      recurrence: "monthly",
      dueDate: ts(3),
      priority: "urgent",
    },
    {
      title: "Service boiler",
      assetId: boilerId,
      roomId: roomIds.utility,
      recurrence: "yearly",
      dueDate: ts(30),
      priority: "normal",
      skillLevel: "professional",
    },
    {
      title: "Reseal bathroom grout",
      roomId: roomIds.bathroom,
      recurrence: "none",
      dueDate: ts(60),
      priority: "low",
    },
  ];

  for (const t of taskDefs) {
    await db.insert(tasks).values({
      id: uuid(),
      propertyId,
      roomId: t.roomId ?? null,
      assetId: t.assetId ?? null,
      title: t.title,
      priority: t.priority ?? "normal",
      skillLevel: t.skillLevel ?? "diy",
      recurrence: t.recurrence,
      dueDate: t.dueDate,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.insert(maintenanceEvents).values({
    id: uuid(),
    propertyId,
    roomId: roomIds.kitchen,
    title: "Kitchen renovation completed",
    description: "New cabinets, countertops, and Bosch dishwasher installed",
    completedAt: ts(-365 * 2),
    cost: 18500,
    contractor: "Nordic Renovations Oy",
    createdAt: now,
  });

  await db.insert(maintenanceEvents).values({
    id: uuid(),
    propertyId,
    roomId: roomIds.utility,
    assetId: boilerId,
    title: "Boiler annual service",
    completedAt: ts(-90),
    cost: 180,
    contractor: "LämpöPro Helsinki",
    notes: "All checks passed, anode replaced",
    createdAt: now,
  });

  await db.insert(notes).values({
    id: uuid(),
    roomId: roomIds.living,
    content: "Oak parquet — supplier: Kährs, installed 2018. Use Bona cleaner only.",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(entityLinks).values({
    id: uuid(),
    propertyId,
    sourceType: "room",
    sourceId: roomIds.living,
    targetType: "material",
    targetId: paintId,
    relationship: "uses",
    createdAt: now,
  });

  console.log("✓ Seed complete — property:", propertyId);
}

seed().catch(console.error);
