import { relations } from "drizzle-orm";
import {
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
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	name: varchar("name", { length: 200 }).notNull(),
	email: varchar("email", { length: 255 }),
	address: text("address"),
	defaultRate: numeric("default_rate", { precision: 10, scale: 2 }),
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
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	clients: many(clients),
	timeEntries: many(timeEntries),
	invoices: many(invoices),
}));

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
