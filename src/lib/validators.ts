import { z } from "zod";

// Clients
export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z
    .string()
    .email("Invalid email")
    .max(255)
    .optional()
    .or(z.literal("")),
  addressLine1: z.string().min(1, "Address line 1 is required").max(255),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  county: z.string().min(1, "County is required").max(100),
  postcode: z.string().min(1, "Postcode is required").max(20),
  vatNumber: z.string().max(50).optional().or(z.literal("")),
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

// User profile
export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  addressLine1: z.string().max(255).optional().or(z.literal("")),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  county: z.string().max(100).optional().or(z.literal("")),
  postcode: z.string().max(20).optional().or(z.literal("")),
  mobile: z.string().max(20).optional().or(z.literal("")),
  bankName: z.string().max(100).optional().or(z.literal("")),
  accountNumber: z.string().max(20).optional().or(z.literal("")),
  sortCode: z.string().max(10).optional().or(z.literal("")),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

// Change password
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
