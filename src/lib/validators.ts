import { z } from "zod";

// Clients
export const clientSchema = z.object({
	name: z.string().min(1, "Name is required").max(200),
	email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
	address: z.string().max(1000).optional().or(z.literal("")),
	defaultRate: z
		.string()
		.optional()
		.or(z.literal(""))
		.transform((v) => (v ? v : undefined))
		.pipe(
			z
				.string()
				.regex(/^\d+(\.\d{1,2})?$/, "Invalid rate format")
				.optional(),
		),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Time entries
export const entrySchema = z.object({
	clientId: z.string().uuid("Select a client"),
	title: z.string().min(1, "Title is required").max(200),
	notes: z.string().max(2000).optional().or(z.literal("")),
	minutes: z.coerce
		.number()
		.int()
		.min(1, "Minutes must be at least 1")
		.max(1440, "Minutes cannot exceed 24 hours"),
	ratePerHour: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/, "Invalid rate format")
		.refine((v) => Number.parseFloat(v) > 0, "Rate must be positive"),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export type EntryInput = z.infer<typeof entrySchema>;

// Invoices
export const invoiceCreateSchema = z.object({
	clientId: z.string().uuid("Select a client"),
	entryIds: z.array(z.string().uuid()).min(1, "Select at least one entry"),
	issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid"]);
