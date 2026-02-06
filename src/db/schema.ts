import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

// --- ENUMS (Tipos fijos para nuestra app) ---
// Definimos roles y prioridades para restringir qué valores pueden entrar
export const roleEnum = pgEnum("role", ["admin", "editor", "viewer"]);
export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "weather",
  "task",
  "message",
  "event",
  "system",
]);

// =========================================================
// 1. AUTENTICACIÓN (Auth.js + Datos de Usuario)
// =========================================================

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Campos estándar de Auth.js
  name: text("name"), // Nombre completo (requerido por Auth.js genérico)
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"), // URL del avatar

  // TUS CAMPOS PERSONALIZADOS
  password: text("password"), // Opcional porque si entra con Google en el futuro no tendrá password
  firstName: text("first_name"),
  lastName: text("last_name"),
  age: integer("age"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// Tabla para vincular proveedores externos (Google, GitHub) en el futuro
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

// Manejo de sesiones (Auth.js)
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Tokens para verificar emails o resetear passwords
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

// =========================================================
// 2. CORE DE EVENTOS Y EQUIPO
// =========================================================

export const events = pgTable("event", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  coverImage: text("cover_image"),

  // Creador del evento (Owner)
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// Tabla intermedia: Usuarios <-> Eventos (Muchos a Muchos con Rol)
export const collaborators = pgTable(
  "collaborator",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").default("viewer").notNull(), // admin, editor, viewer
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.userId] }), // Un usuario solo puede estar una vez en un evento
  }),
);

// =========================================================
// 3. CHECKLIST (TAREAS)
// =========================================================
export const checklistCategories = pgTable("checklist_category", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }), // Si borras evento, chau categorías

  name: text("name").notNull(), // Ej: "Ropa", "Documentos"
  color: text("color"), // Opcional: Si quieres que cada cat tenga un colorcito en el UI

  createdAt: timestamp("created_at").defaultNow(),
});
export const checklistItems = pgTable("checklist_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => checklistCategories.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),

  // Asignado a un usuario específico (opcional)
  assignedToId: text("assigned_to_id").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").defaultNow(),
});

// =========================================================
// 4. BITÁCORA (FOTOS Y VIDEOS)
// =========================================================

export const memories = pgTable("memory", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),

  url: text("url").notNull(), // URL de la imagen en Cloudinary/S3/etc
  alt: text("alt"),
  type: text("type").default("image"), // image | video

  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
});

// Reacciones a las fotos (Lo que pediste de los emojis)
export const memoryReactions = pgTable(
  "memory_reaction",
  {
    memoryId: uuid("memory_id")
      .notNull()
      .references(() => memories.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(), // El emoji en sí: "❤️", "😂", etc.
  },
  (t) => ({
    pk: primaryKey({ columns: [t.memoryId, t.userId] }), // Un usuario = 1 reacción por foto
  }),
);

// =========================================================
// 5. NOTIFICACIONES
// =========================================================

export const notifications = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Quien recibe la noti

  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),

  // Opcional: Vincular a un evento si la noti es sobre eso
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "cascade",
  }),

  createdAt: timestamp("created_at").defaultNow(),
});

// =========================================================
// RELACIONES (Drizzle Relations) - Para facilitar queries
// =========================================================

export const usersRelations = relations(users, ({ many }) => ({
  eventsCreated: many(events), // Eventos que creó
  collaborations: many(collaborators), // Eventos en los que participa
  assignedItems: many(checklistItems), // Tareas asignadas
  uploadedMemories: many(memories), // Fotos que subió
  notifications: many(notifications),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id],
  }),
  collaborators: many(collaborators),
  checklistItems: many(checklistItems),
  checklistCategories: many(checklistCategories),
  memories: many(memories),
}));

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  event: one(events, {
    fields: [collaborators.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [collaborators.userId],
    references: [users.id],
  }),
}));

export const checklistCategoriesRelations = relations(
  checklistCategories,
  ({ one, many }) => ({
    event: one(events, {
      fields: [checklistCategories.eventId],
      references: [events.id],
    }),
    items: many(checklistItems), // Una categoría tiene muchos ítems
  }),
);

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  category: one(checklistCategories, {
    fields: [checklistItems.categoryId],
    references: [checklistCategories.id],
  }),
  assignedTo: one(users, {
    fields: [checklistItems.assignedToId],
    references: [users.id],
  }),
}));

export const memoriesRelations = relations(memories, ({ one, many }) => ({
  event: one(events, {
    fields: [memories.eventId],
    references: [events.id],
  }),
  uploadedBy: one(users, {
    fields: [memories.uploadedById],
    references: [users.id],
  }),
  reactions: many(memoryReactions),
}));

export const memoryReactionsRelations = relations(
  memoryReactions,
  ({ one }) => ({
    memory: one(memories, {
      fields: [memoryReactions.memoryId],
      references: [memories.id],
    }),
    user: one(users, {
      fields: [memoryReactions.userId],
      references: [users.id],
    }),
  }),
);
