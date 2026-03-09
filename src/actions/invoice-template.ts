"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  type InvoiceTemplateConfig,
  invoiceTemplateSchema,
  parseTemplate,
} from "@/lib/invoice-template";
import { requireSession } from "@/lib/session";

export async function getInvoiceTemplate() {
  const session = await requireSession();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      name: true,
      email: true,
      addressLine1: true,
      addressLine2: true,
      county: true,
      postcode: true,
      mobile: true,
      bankName: true,
      accountNumber: true,
      sortCode: true,
      invoiceTemplate: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    config: parseTemplate(user.invoiceTemplate),
    profile: {
      name: user.name,
      email: user.email,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      county: user.county,
      postcode: user.postcode,
      mobile: user.mobile,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      sortCode: user.sortCode,
    },
  };
}

export async function updateInvoiceTemplate(input: InvoiceTemplateConfig) {
  const session = await requireSession();
  const data = invoiceTemplateSchema.parse(input);

  await db
    .update(users)
    .set({ invoiceTemplate: JSON.stringify(data) })
    .where(eq(users.id, session.user.id));

  revalidatePath("/invoices/template");
}
