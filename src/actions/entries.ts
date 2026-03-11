"use server";

import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { timeEntries } from "@/db/schema";
import { PAGE_SIZE, type PaginatedResult } from "@/lib/pagination";
import { requireSession } from "@/lib/session";
import { getCurrentTaxYearStart, getTaxYearBounds } from "@/lib/tax-year";
import type { TimeEntryWithClient } from "@/lib/types";
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
    orderBy: [sortFn(orderCol), desc(timeEntries.createdAt)],
    limit: options?.limit,
  });
}

export async function getEntriesPaginated(options: {
  dateStart: string;
  dateEnd: string;
  clientId?: string;
  invoicedStatus?: "all" | "uninvoiced" | "invoiced";
  page: number;
  offset: number;
  limit?: number;
  sortBy?: "date" | "amount" | "title";
  sortDir?: "asc" | "desc";
}): Promise<PaginatedResult<TimeEntryWithClient>> {
  const session = await requireSession();

  const conditions = [
    eq(timeEntries.userId, session.user.id),
    gte(timeEntries.date, options.dateStart),
    lte(timeEntries.date, options.dateEnd),
  ];

  if (options.clientId) {
    conditions.push(eq(timeEntries.clientId, options.clientId));
  }

  if (options.invoicedStatus === "uninvoiced") {
    conditions.push(isNull(timeEntries.invoiceId));
    conditions.push(eq(timeEntries.manuallyInvoiced, false));
  } else if (options.invoicedStatus === "invoiced") {
    const invoicedCondition = or(
      isNotNull(timeEntries.invoiceId),
      eq(timeEntries.manuallyInvoiced, true),
    );
    if (invoicedCondition) conditions.push(invoicedCondition);
  }

  const sortFn = options.sortDir === "asc" ? asc : desc;
  let orderCol: Parameters<typeof asc>[0];
  switch (options.sortBy) {
    case "amount":
      orderCol = timeEntries.ratePerHour;
      break;
    case "title":
      orderCol = timeEntries.title;
      break;
    default:
      orderCol = timeEntries.date;
  }

  const whereClause = and(...conditions);
  const limit = options.limit ?? PAGE_SIZE;

  const [data, [{ count }]] = await Promise.all([
    db.query.timeEntries.findMany({
      where: whereClause,
      with: { client: true },
      orderBy: [sortFn(orderCol), desc(timeEntries.createdAt)],
      limit,
      offset: options.offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(timeEntries)
      .where(whereClause),
  ]);

  const total = Number(count);
  return {
    data: data as TimeEntryWithClient[],
    total,
    page: options.page,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
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

const bulkIdsSchema = z
  .array(z.string().uuid())
  .min(1, "Select at least one entry");

export async function bulkMarkInvoiced(ids: string[]) {
  const session = await requireSession();
  const validIds = bulkIdsSchema.parse(ids);

  await db
    .update(timeEntries)
    .set({ manuallyInvoiced: true })
    .where(
      and(
        inArray(timeEntries.id, validIds),
        eq(timeEntries.userId, session.user.id),
        isNull(timeEntries.invoiceId),
      ),
    );

  revalidatePath("/entries");
  revalidatePath("/");
}

export async function bulkUnmarkInvoiced(ids: string[]) {
  const session = await requireSession();
  const validIds = bulkIdsSchema.parse(ids);

  await db
    .update(timeEntries)
    .set({ manuallyInvoiced: false })
    .where(
      and(
        inArray(timeEntries.id, validIds),
        eq(timeEntries.userId, session.user.id),
        isNull(timeEntries.invoiceId),
      ),
    );

  revalidatePath("/entries");
  revalidatePath("/");
}

export async function bulkDeleteEntries(ids: string[]) {
  const session = await requireSession();
  const validIds = bulkIdsSchema.parse(ids);

  await db
    .delete(timeEntries)
    .where(
      and(
        inArray(timeEntries.id, validIds),
        eq(timeEntries.userId, session.user.id),
        isNull(timeEntries.invoiceId),
        eq(timeEntries.manuallyInvoiced, false),
      ),
    );

  revalidatePath("/entries");
  revalidatePath("/");
}
