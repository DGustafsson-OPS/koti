import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  propertyType: text("property_type"),
  yearBuilt: integer("year_built"),
  sizeSqm: real("size_sqm"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const rooms = sqliteTable(
  "rooms",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    floor: text("floor"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [index("idx_rooms_property").on(t.propertyId)]
);

export const materials = sqliteTable(
  "materials",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull().default("other"),
    brand: text("brand"),
    colorCode: text("color_code"),
    sku: text("sku"),
    finish: text("finish"),
    supplier: text("supplier"),
    leftoverLocation: text("leftover_location"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [index("idx_materials_property").on(t.propertyId)]
);

export const roomMaterials = sqliteTable("room_materials", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  materialId: text("material_id")
    .notNull()
    .references(() => materials.id, { onDelete: "cascade" }),
  surface: text("surface"),
  notes: text("notes"),
  appliedAt: integer("applied_at"),
});

export const assets = sqliteTable(
  "assets",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    category: text("category").notNull().default("other"),
    brand: text("brand"),
    model: text("model"),
    serialNumber: text("serial_number"),
    purchaseDate: integer("purchase_date"),
    purchasePrice: real("purchase_price"),
    replacementValue: real("replacement_value"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    index("idx_assets_property").on(t.propertyId),
    index("idx_assets_room").on(t.roomId),
  ]
);

export const warranties = sqliteTable(
  "warranties",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    provider: text("provider"),
    expiresAt: integer("expires_at").notNull(),
    terms: text("terms"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("idx_warranties_expires").on(t.expiresAt)]
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
    assetId: text("asset_id").references(() => assets.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority").notNull().default("normal"),
    skillLevel: text("skill_level").notNull().default("diy"),
    recurrence: text("recurrence").notNull().default("none"),
    recurrenceIntervalDays: integer("recurrence_interval_days"),
    dueDate: integer("due_date"),
    estimatedCost: real("estimated_cost"),
    estimatedMinutes: integer("estimated_minutes"),
    status: text("status").notNull().default("pending"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    index("idx_tasks_property").on(t.propertyId),
    index("idx_tasks_due").on(t.dueDate),
  ]
);

export const maintenanceEvents = sqliteTable(
  "maintenance_events",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
    roomId: text("room_id").references(() => rooms.id, { onDelete: "set null" }),
    assetId: text("asset_id").references(() => assets.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    completedAt: integer("completed_at").notNull(),
    cost: real("cost"),
    contractor: text("contractor"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("idx_events_property").on(t.propertyId),
    index("idx_events_completed").on(t.completedAt),
  ]
);

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const entityLinks = sqliteTable(
  "entity_links",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    relationship: text("relationship").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    index("idx_entity_links_source").on(t.sourceType, t.sourceId),
    index("idx_entity_links_target").on(t.targetType, t.targetId),
  ]
);

export type Property = typeof properties.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Warranty = typeof warranties.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type MaintenanceEvent = typeof maintenanceEvents.$inferSelect;
export type Note = typeof notes.$inferSelect;
