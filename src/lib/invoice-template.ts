import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex colour");

export const invoiceTemplateSchema = z.object({
  // Branding
  companyName: z.string().max(255).optional().or(z.literal("")),
  titleText: z.string().max(50).optional().or(z.literal("")),

  // Colours
  accentColor: hexColor,
  titleColor: hexColor,
  textColor: hexColor,
  tableHeaderBgColor: hexColor,
  tableHeaderTextColor: hexColor,
  tableBorderColor: hexColor,
  footerTextColor: hexColor,

  // Typography
  titleSize: z.enum(["small", "medium", "large"]),
  bodySize: z.enum(["small", "medium", "large"]),

  // Layout
  titleAlignment: z.enum(["left", "center", "right"]),
  showInvoiceFor: z.boolean(),
  clientDetailsPosition: z.enum(["left", "right"]),

  // Table
  showHoursColumn: z.boolean(),
  showRateColumn: z.boolean(),
  hoursFormat: z.enum(["decimal", "hm"]),

  // Footer
  footer: z.string().max(1000).optional().or(z.literal("")),
});

export type InvoiceTemplateConfig = z.infer<typeof invoiceTemplateSchema>;

export const FOOTER_PLACEHOLDERS = [
  { token: "%accountNumber%", label: "Account Number" },
  { token: "%sortCode%", label: "Sort Code" },
  { token: "%bankName%", label: "Bank Name" },
  { token: "%name%", label: "Name" },
  { token: "%address%", label: "Address" },
  { token: "%mobile%", label: "Mobile" },
  { token: "%email%", label: "Email" },
  { token: "%reference%", label: "Reference" },
] as const;

export interface FooterProfileData {
  name: string;
  email: string;
  addressLine1: string | null;
  addressLine2: string | null;
  county: string | null;
  postcode: string | null;
  mobile: string | null;
  bankName: string | null;
  accountNumber: string | null;
  sortCode: string | null;
  reference: string | null;
}

export function resolveFooterPlaceholders(
  text: string,
  profile: FooterProfileData,
): string {
  const address = [
    profile.addressLine1,
    profile.addressLine2,
    profile.county,
    profile.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  const map: Record<string, string> = {
    "%accountNumber%": profile.accountNumber ?? "",
    "%sortCode%": profile.sortCode ?? "",
    "%bankName%": profile.bankName ?? "",
    "%name%": profile.name,
    "%address%": address,
    "%mobile%": profile.mobile ?? "",
    "%email%": profile.email,
    "%reference%": profile.reference ?? "",
  };

  return text.replace(/%\w+%/g, (match) => map[match] ?? match);
}

const DEFAULT_FOOTER_NOTES = `No VAT to pay. Payment due within 14 days of invoice. E&OE.
Payment by bank transfer.
Bank transfers to account: %accountNumber%, sort-code: %sortCode%, reference: %reference%

%name% | %address%
tel: %mobile% | e-mail: %email%`;

export const defaultTemplate: InvoiceTemplateConfig = {
  companyName: "",
  titleText: "INVOICE",

  accentColor: "#1a1a1a",
  titleColor: "#1a1a1a",
  textColor: "#1a1a1a",
  tableHeaderBgColor: "#ffffff",
  tableHeaderTextColor: "#1a1a1a",
  tableBorderColor: "#1a1a1a",
  footerTextColor: "#1a1a1a",

  titleSize: "large",
  bodySize: "medium",

  titleAlignment: "left",
  showInvoiceFor: true,
  clientDetailsPosition: "right",

  showHoursColumn: true,
  showRateColumn: true,
  hoursFormat: "decimal",

  footer: DEFAULT_FOOTER_NOTES,
};

export function parseTemplate(json: string | null): InvoiceTemplateConfig {
  if (!json) return defaultTemplate;
  try {
    const raw: unknown = JSON.parse(json);
    const parsed = invoiceTemplateSchema.strip().parse(raw);

    // Migration: old configs with showBankDetails + empty footer
    const rawObj = raw as Record<string, unknown>;
    const hadBankDetails = rawObj.showBankDetails === true;
    const hadEmptyFooter = !parsed.footer;
    if (hadBankDetails && hadEmptyFooter) {
      parsed.footer = DEFAULT_FOOTER_NOTES;
    }

    return { ...defaultTemplate, ...parsed };
  } catch {
    return defaultTemplate;
  }
}
