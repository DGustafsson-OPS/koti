import {
  mysqlTable,
  varchar,
  text,
  int,
  double,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }),
    name: varchar("name", { length: 255 }),
    image: text("image"),
    role: varchar("role", { length: 32 }).notNull().default("member"),
    createdAt: int("created_at").notNull(),
    updatedAt: int("updated_at").notNull(),
  },
  (t) => [index("idx_users_email").on(t.email)]
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    createdAt: int("created_at").notNull(),
  },
  (t) => [index("idx_accounts_provider").on(t.provider, t.providerAccountId)]
);

export const properties = mysqlTable("properties", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  propertyType: varchar("property_type", { length: 64 }),
  yearBuilt: int("year_built"),
  sizeSqm: double("size_sqm"),
  notes: text("notes"),
  kotiakkuApiKeyEnc: text("kotiakku_api_key_enc"),
  kotiakkuConnectedAt: int("kotiakku_connected_at"),
  energySpotMarginCents: double("energy_spot_margin_cents"),
  energyImportTransferCents: double("energy_import_transfer_cents"),
  energyElectricityTaxCents: double("energy_electricity_tax_cents"),
  energyExportTransferCents: double("energy_export_transfer_cents"),
  createdAt: int("created_at").notNull(),
  updatedAt: int("updated_at").notNull(),
});

export const buildings = mysqlTable(
  "buildings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    buildingType: varchar("building_type", { length: 64 }),
    notes: text("notes"),
    createdAt: int("created_at").notNull(),
    updatedAt: int("updated_at").notNull(),
  },
  (t) => [index("idx_buildings_property").on(t.propertyId)]
);

export const rooms = mysqlTable(
  "rooms",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    buildingId: varchar("building_id", { length: 36 }).references(() => buildings.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    floor: varchar("floor", { length: 64 }),
    notes: text("notes"),
    createdAt: int("created_at").notNull(),
    updatedAt: int("updated_at").notNull(),
  },
  (t) => [
    index("idx_rooms_property").on(t.propertyId),
    index("idx_rooms_building").on(t.buildingId),
  ]
);

export const materials = mysqlTable(
  "materials",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 64 }).notNull().default("other"),
    brand: varchar("brand", { length: 255 }),
    colorCode: varchar("color_code", { length: 64 }),
    sku: varchar("sku", { length: 128 }),
    finish: varchar("finish", { length: 64 }),
    supplier: varchar("supplier", { length: 255 }),
    leftoverLocation: text("leftover_location"),
    notes: text("notes"),
    createdAt: int("created_at").notNull(),
    updatedAt: int("updated_at").notNull(),
  },
  (t) => [index("idx_materials_property").on(t.propertyId)]
);

export const roomMaterials = mysqlTable("room_materials", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roomId: varchar("room_id", { length: 36 })
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  materialId: varchar("material_id", { length: 36 })
    .notNull()
    .references(() => materials.id, { onDelete: "cascade" }),
  surface: varchar("surface", { length: 128 }),
  notes: text("notes"),
  appliedAt: int("applied_at"),
});

export const assets = mysqlTable(
  "assets",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    roomId: varchar("room_id", { length: 36 }).references(() => rooms.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 64 }).notNull().default("other"),
    brand: varchar("brand", { length: 255 }),
    model: varchar("model", { length: 255 }),
    serialNumber: varchar("serial_number", { length: 128 }),
    purchaseDate: int("purchase_date"),
    purchasePrice: double("purchase_price"),
    replacementValue: double("replacement_value"),
    notes: text("notes"),
    createdAt: int("created_at").notNull(),
    updatedAt: int("updated_at").notNull(),
  },
  (t) => [
    index("idx_assets_property").on(t.propertyId),
    index("idx_assets_room").on(t.roomId),
  ]
);

export const warranties = mysqlTable(
  "warranties",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    assetId: varchar("asset_id", { length: 36 })
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 255 }),
    expiresAt: int("expires_at").notNull(),
    terms: text("terms"),
    notes: text("notes"),
    createdAt: int("created_at").notNull(),
  },
  (t) => [index("idx_warranties_expires").on(t.expiresAt)]
);

export const tasks = mysqlTable(
  "tasks",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    roomId: varchar("room_id", { length: 36 }).references(() => rooms.id, {
      onDelete: "set null",
    }),
    assetId: varchar("asset_id", { length: 36 }).references(() => assets.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    priority: varchar("priority", { length: 32 }).notNull().default("normal"),
    skillLevel: varchar("skill_level", { length: 32 }).notNull().default("diy"),
    recurrence: varchar("recurrence", { length: 32 }).notNull().default("none"),
    recurrenceIntervalDays: int("recurrence_interval_days"),
    dueDate: int("due_date"),
    estimatedCost: double("estimated_cost"),
    estimatedMinutes: int("estimated_minutes"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    createdAt: int("created_at").notNull(),
    updatedAt: int("updated_at").notNull(),
  },
  (t) => [
    index("idx_tasks_property").on(t.propertyId),
    index("idx_tasks_due").on(t.dueDate),
  ]
);

export const contractors = mysqlTable("contractors", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 128 }),
  phone: varchar("phone", { length: 64 }),
  email: varchar("email", { length: 255 }),
  notes: text("notes"),
  createdAt: int("created_at").notNull(),
  updatedAt: int("updated_at").notNull(),
});

export const maintenanceEvents = mysqlTable(
  "maintenance_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    taskId: varchar("task_id", { length: 36 }).references(() => tasks.id, {
      onDelete: "set null",
    }),
    roomId: varchar("room_id", { length: 36 }).references(() => rooms.id, {
      onDelete: "set null",
    }),
    assetId: varchar("asset_id", { length: 36 }).references(() => assets.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    completedAt: int("completed_at").notNull(),
    cost: double("cost"),
    contractor: varchar("contractor", { length: 255 }),
    contractorId: varchar("contractor_id", { length: 36 }).references(() => contractors.id, {
      onDelete: "set null",
    }),
    taxDeductible: boolean("tax_deductible").notNull().default(false),
    notes: text("notes"),
    createdAt: int("created_at").notNull(),
  },
  (t) => [
    index("idx_events_property").on(t.propertyId),
    index("idx_events_completed").on(t.completedAt),
  ]
);

export const notes = mysqlTable("notes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roomId: varchar("room_id", { length: 36 })
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: int("created_at").notNull(),
  updatedAt: int("updated_at").notNull(),
});

export const entityLinks = mysqlTable(
  "entity_links",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    sourceType: varchar("source_type", { length: 64 }).notNull(),
    sourceId: varchar("source_id", { length: 36 }).notNull(),
    targetType: varchar("target_type", { length: 64 }).notNull(),
    targetId: varchar("target_id", { length: 36 }).notNull(),
    relationship: varchar("relationship", { length: 64 }).notNull(),
    createdAt: int("created_at").notNull(),
  },
  (t) => [
    index("idx_entity_links_source").on(t.sourceType, t.sourceId),
    index("idx_entity_links_target").on(t.targetType, t.targetId),
  ]
);

export const attachments = mysqlTable(
  "attachments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    propertyId: varchar("property_id", { length: 36 })
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    storedName: varchar("stored_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 128 }),
    sizeBytes: int("size_bytes"),
    createdAt: int("created_at").notNull(),
  },
  (t) => [
    index("idx_attachments_entity").on(t.entityType, t.entityId),
    index("idx_attachments_property").on(t.propertyId),
  ]
);

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Building = typeof buildings.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Warranty = typeof warranties.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Contractor = typeof contractors.$inferSelect;
export type MaintenanceEvent = typeof maintenanceEvents.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
