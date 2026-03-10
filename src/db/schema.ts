import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  county: varchar("county", { length: 100 }),
  postcode: varchar("postcode", { length: 20 }),
  mobile: varchar("mobile", { length: 20 }),
  bankName: varchar("bank_name", { length: 100 }),
  accountNumber: varchar("account_number", { length: 20 }),
  sortCode: varchar("sort_code", { length: 10 }),
  invoiceTemplate: text("invoice_template"),
  twoFactorMethod: varchar("two_factor_method", { length: 10 }),
  totpSecret: text("totp_secret"),
  backupCodes: text("backup_codes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }),
  addressLine1: varchar("address_line1", { length: 255 }).notNull().default(""),
  addressLine2: varchar("address_line2", { length: 255 }),
  county: varchar("county", { length: 100 }).notNull().default(""),
  postcode: varchar("postcode", { length: 20 }).notNull().default(""),
  vatNumber: varchar("vat_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  issuedAt: date("issued_at").notNull(),
  paidAt: date("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeEntries = pgTable("time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  title: varchar("title", { length: 200 }).notNull(),
  notes: text("notes"),
  minutes: integer("minutes").notNull(),
  ratePerHour: numeric("rate_per_hour", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  manuallyInvoiced: boolean("manually_invoiced").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  timeEntries: many(timeEntries),
  invoices: many(invoices),
  verificationTokens: many(verificationTokens),
}));

export const verificationTokensRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  timeEntries: many(timeEntries),
  invoices: many(invoices),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [timeEntries.clientId],
    references: [clients.id],
  }),
  invoice: one(invoices, {
    fields: [timeEntries.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  timeEntries: many(timeEntries),
}));
