"use server";

import { and, asc, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { timeEntries } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { getCurrentTaxYearStart, getTaxYearBounds } from "@/lib/tax-year";
import { type EntryInput, entrySchema } from "@/lib/validators";

export async function getEntries(options?: {
  taxYear?: number;
  clientId?: string;
  uninvoicedOnly?: boolean;
  limit?: number;
  sortBy?: "date" | "amount" | "title";
  sortDir?: "asc" | "desc";
}) {
  const session = await requireSession();
  const taxYear = options?.taxYear ?? getCurrentTaxYearStart();
  const bounds = getTaxYearBounds(taxYear);

  const conditions = [
    eq(timeEntries.userId, session.user.id),
    gte(timeEntries.date, bounds.start),
    lte(timeEntries.date, bounds.end),
  ];

  if (options?.clientId) {
    conditions.push(eq(timeEntries.clientId, options.clientId));
  }

  if (options?.uninvoicedOnly) {
    conditions.push(isNull(timeEntries.invoiceId));
    conditions.push(eq(timeEntries.manuallyInvoiced, false));
  }

  const sortFn = options?.sortDir === "asc" ? asc : desc;
  let orderCol: Parameters<typeof asc>[0];
  switch (options?.sortBy) {
    case "amount":
      orderCol = timeEntries.ratePerHour;
      break;
    case "title":
      orderCol = timeEntries.title;
      break;
    default:
      orderCol = timeEntries.date;
  }

  return db.query.timeEntries.findMany({
    where: and(...conditions),
    with: { client: true },
    orderBy: [sortFn(orderCol)],
    limit: options?.limit,
  });
}

export async function getEntry(id: string) {
  const session = await requireSession();
  return db.query.timeEntries.findFirst({
    where: and(eq(timeEntries.id, id), eq(timeEntries.userId, session.user.id)),
  });
}

export async function createEntry(input: EntryInput) {
  const session = await requireSession();
  const data = entrySchema.parse(input);

  await db.insert(timeEntries).values({
    userId: session.user.id,
    clientId: data.clientId,
    title: data.title,
    notes: data.notes || null,
    minutes: data.minutes,
    ratePerHour: data.ratePerHour,
    date: data.date,
  });

  revalidatePath("/entries");
  revalidatePath("/");
}

export async function updateEntry(id: string, input: EntryInput) {
  const session = await requireSession();
  const data = entrySchema.parse(input);

  await db
    .update(timeEntries)
    .set({
      clientId: data.clientId,
      title: data.title,
      notes: data.notes || null,
      minutes: data.minutes,
      ratePerHour: data.ratePerHour,
      date: data.date,
    })
    .where(
      and(eq(timeEntries.id, id), eq(timeEntries.userId, session.user.id)),
    );

  revalidatePath("/entries");
  revalidatePath("/");
}

export async function deleteEntry(id: string) {
  const session = await requireSession();

  await db
    .delete(timeEntries)
    .where(
      and(eq(timeEntries.id, id), eq(timeEntries.userId, session.user.id)),
    );

  revalidatePath("/entries");
  revalidatePath("/");
}

export async function getUninvoicedEntriesForClient(clientId: string) {
  const entries = await getEntries({
    clientId,
    uninvoicedOnly: true,
    sortBy: "date",
    sortDir: "asc",
  });
  return entries.map((e) => ({
    id: e.id,
    title: e.title,
    minutes: e.minutes,
    ratePerHour: e.ratePerHour,
    date: e.date,
  }));
}

export async function toggleManuallyInvoiced(id: string) {
  const session = await requireSession();

  const entry = await db.query.timeEntries.findFirst({
    where: and(eq(timeEntries.id, id), eq(timeEntries.userId, session.user.id)),
  });

  if (!entry) {
    throw new Error("Entry not found");
  }

  if (entry.invoiceId) {
    throw new Error("Cannot toggle manually invoiced on an invoiced entry");
  }

  await db
    .update(timeEntries)
    .set({ manuallyInvoiced: !entry.manuallyInvoiced })
    .where(
      and(eq(timeEntries.id, id), eq(timeEntries.userId, session.user.id)),
    );

  revalidatePath("/entries");
  revalidatePath("/");
}
