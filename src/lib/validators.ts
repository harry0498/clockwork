import { z } from "zod";

// Clients
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or fewer"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),
  addressLine1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(255, "Address must be 255 characters or fewer"),
  addressLine2: z
    .string()
    .max(255, "Address must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),
  county: z
    .string()
    .min(1, "County is required")
    .max(100, "County must be 100 characters or fewer"),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .max(20, "Postcode must be 20 characters or fewer"),
  vatNumber: z
    .string()
    .max(50, "VAT number must be 50 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Time entries
export const entrySchema = z.object({
  clientId: z.string().uuid("Select a client"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  notes: z
    .string()
    .max(2000, "Notes must be 2,000 characters or fewer")
    .optional()
    .or(z.literal("")),
  minutes: z
    .number({ message: "Minutes is required" })
    .int("Minutes must be a whole number")
    .min(1, "Minutes must be at least 1")
    .max(1440, "Minutes cannot exceed 24 hours"),
  ratePerHour: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid rate (e.g. 25 or 25.50)")
    .refine((v) => Number.parseFloat(v) > 0, "Rate must be positive"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date"),
});

export type EntryInput = z.infer<typeof entrySchema>;

// Invoices
export const invoiceCreateSchema = z.object({
  clientId: z.string().uuid("Select a client"),
  entryIds: z.array(z.string().uuid()).min(1, "Select at least one entry"),
  issuedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date"),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid"]);

// User profile
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or fewer"),
  addressLine1: z
    .string()
    .max(255, "Address must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),
  addressLine2: z
    .string()
    .max(255, "Address must be 255 characters or fewer")
    .optional()
    .or(z.literal("")),
  county: z
    .string()
    .max(100, "County must be 100 characters or fewer")
    .optional()
    .or(z.literal("")),
  postcode: z
    .string()
    .max(20, "Postcode must be 20 characters or fewer")
    .optional()
    .or(z.literal("")),
  mobile: z
    .string()
    .max(20, "Mobile must be 20 characters or fewer")
    .optional()
    .or(z.literal("")),
  bankName: z
    .string()
    .max(100, "Bank name must be 100 characters or fewer")
    .optional()
    .or(z.literal("")),
  accountNumber: z
    .string()
    .max(20, "Account number must be 20 characters or fewer")
    .optional()
    .or(z.literal("")),
  sortCode: z
    .string()
    .max(10, "Sort code must be 10 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

// Login
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Signup
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name must be 255 characters or fewer"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

// Forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// 2FA verification
export const verifyTwoFactorSchema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().min(1, "Code is required"),
  isBackupCode: z.boolean().default(false),
});

export type VerifyTwoFactorInput = z.infer<typeof verifyTwoFactorSchema>;

// TOTP setup verification
export const totpSetupSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code from your authenticator"),
  secret: z.string().min(1),
});

export type TotpSetupInput = z.infer<typeof totpSetupSchema>;

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
