import type { clients, invoices, timeEntries, users } from "@/db/schema";

export type Client = typeof clients.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type User = typeof users.$inferSelect;

export type UserProfile = Pick<
  User,
  | "name"
  | "email"
  | "addressLine1"
  | "addressLine2"
  | "county"
  | "postcode"
  | "mobile"
  | "bankName"
  | "accountNumber"
  | "sortCode"
  | "invoiceTemplate"
>;
export type ClientPick = Pick<Client, "id" | "name">;
export type TimeEntryWithClient = TimeEntry & { client: ClientPick };
export type InvoiceWithClient = Invoice & { client: ClientPick };

export interface ClientWithStats {
  id: string;
  name: string;
  email: string | null;
  totalMinutes: number;
  totalEarned: number;
  unbilledAmount: number;
}

export type InvoiceEntry = Pick<
  TimeEntry,
  "id" | "title" | "minutes" | "ratePerHour" | "date"
>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string };
