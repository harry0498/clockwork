import type { clients, invoices, timeEntries, users } from "@/db/schema";

export type Client = typeof clients.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type User = typeof users.$inferSelect;

export type ClientPick = Pick<Client, "id" | "name">;
export type TimeEntryWithClient = TimeEntry & { client: ClientPick };
export type InvoiceWithClient = Invoice & { client: ClientPick };
