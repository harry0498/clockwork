"use server";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { invoices, timeEntries } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { getCurrentTaxYearStart, getTaxYearBounds } from "@/lib/tax-year";
import { invoiceCreateSchema, invoiceStatusSchema } from "@/lib/validators";

async function generateInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  const num = Number(result.count) + 1;
  return `CW-${year}-${num.toString().padStart(3, "0")}`;
}

export async function createInvoice(data: {
  clientId: string;
  entryIds: string[];
  issuedAt: string;
}) {
  const session = await requireSession();
  const parsed = invoiceCreateSchema.parse(data);

  // Verify all entries belong to user and client, and are uninvoiced
  const entries = await db.query.timeEntries.findMany({
    where: and(
      eq(timeEntries.userId, session.user.id),
      eq(timeEntries.clientId, parsed.clientId),
    ),
  });

  const validEntryIds = entries
    .filter((e) => parsed.entryIds.includes(e.id) && !e.invoiceId)
    .map((e) => e.id);

  if (validEntryIds.length === 0) {
    throw new Error("No valid entries selected");
  }

  // Calculate total
  const selectedEntries = entries.filter((e) => validEntryIds.includes(e.id));
  const totalAmount = selectedEntries.reduce(
    (sum, e) => sum + (e.minutes / 60) * Number.parseFloat(e.ratePerHour),
    0,
  );

  const invoiceNumber = await generateInvoiceNumber(session.user.id);

  // Create invoice and link entries in a transaction
  await db.transaction(async (tx) => {
    const [invoice] = await tx
      .insert(invoices)
      .values({
        userId: session.user.id,
        clientId: parsed.clientId,
        invoiceNumber,
        totalAmount: totalAmount.toFixed(2),
        issuedAt: parsed.issuedAt,
      })
      .returning();

    for (const entryId of validEntryIds) {
      await tx
        .update(timeEntries)
        .set({ invoiceId: invoice.id })
        .where(eq(timeEntries.id, entryId));
    }
  });

  revalidatePath("/invoices");
  revalidatePath("/entries");
  revalidatePath("/");
}

export async function getInvoices(taxYear?: number) {
  const session = await requireSession();
  const year = taxYear ?? getCurrentTaxYearStart();
  const bounds = getTaxYearBounds(year);

  return db.query.invoices.findMany({
    where: and(
      eq(invoices.userId, session.user.id),
      gte(invoices.issuedAt, bounds.start),
      lte(invoices.issuedAt, bounds.end),
    ),
    with: { client: true },
    orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
  });
}

export async function getInvoice(id: string) {
  const session = await requireSession();
  return db.query.invoices.findFirst({
    where: and(eq(invoices.id, id), eq(invoices.userId, session.user.id)),
    with: {
      client: true,
      timeEntries: true,
    },
  });
}

export async function deleteInvoice(id: string) {
  const session = await requireSession();

  await db.transaction(async (tx) => {
    // Unlink time entries first
    await tx
      .update(timeEntries)
      .set({ invoiceId: null })
      .where(eq(timeEntries.invoiceId, id));

    await tx
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id)));
  });

  revalidatePath("/invoices");
  revalidatePath("/entries");
  revalidatePath("/");
}

export async function updateInvoiceStatus(
  id: string,
  status: "draft" | "sent" | "paid",
) {
  const session = await requireSession();
  invoiceStatusSchema.parse(status);

  const updateData: Record<string, unknown> = { status };
  if (status === "paid") {
    updateData.paidAt = new Date().toISOString().split("T")[0];
  }

  await db
    .update(invoices)
    .set(updateData)
    .where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id)));

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
}
