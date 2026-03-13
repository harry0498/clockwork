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
import { clients, timeEntries } from "@/db/schema";
import { PAGE_SIZE, type PaginatedResult } from "@/lib/pagination";
import { requireSession } from "@/lib/session";
import { getCurrentTaxYearStart, getTaxYearBounds } from "@/lib/tax-year";
import type { TimeEntryWithClient } from "@/lib/types";
import { type EntryInput, entrySchema } from "@/lib/validators";

function revalidateEntries() {
  revalidatePath("/entries");
  revalidatePath("/");
}

async function verifyClientOwnership(clientId: string, userId: string) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, clientId), eq(clients.userId, userId)),
    columns: { id: true },
  });
  if (!client) {
    throw new Error("Client not found");
  }
}

async function withBulkEntries(
  ids: string[],
  fn: (validIds: string[], userId: string) => Promise<void>,
) {
  const session = await requireSession();
  const validIds = bulkIdsSchema.parse(ids);
  await fn(validIds, session.user.id);
  revalidateEntries();
}

function getEntrySortColumn(
  sortBy?: "date" | "amount" | "title",
): Parameters<typeof asc>[0] {
  switch (sortBy) {
    case "amount":
      return timeEntries.ratePerHour;
    case "title":
      return timeEntries.title;
    default:
      return timeEntries.date;
  }
}

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
  const orderCol = getEntrySortColumn(options?.sortBy);

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
  const orderCol = getEntrySortColumn(options.sortBy);

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

  await verifyClientOwnership(data.clientId, session.user.id);

  await db.insert(timeEntries).values({
    userId: session.user.id,
    clientId: data.clientId,
    title: data.title,
    notes: data.notes || null,
    minutes: data.minutes,
    ratePerHour: data.ratePerHour,
    date: data.date,
  });

  revalidateEntries();
}

export async function updateEntry(id: string, input: EntryInput) {
  const session = await requireSession();
  const data = entrySchema.parse(input);

  await verifyClientOwnership(data.clientId, session.user.id);

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

  revalidateEntries();
}

export async function deleteEntry(id: string) {
  const session = await requireSession();

  await db
    .delete(timeEntries)
    .where(
      and(eq(timeEntries.id, id), eq(timeEntries.userId, session.user.id)),
    );

  revalidateEntries();
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

  revalidateEntries();
}

const bulkIdsSchema = z
  .array(z.string().uuid())
  .min(1, "Select at least one entry")
  .max(500, "Too many entries selected");

export async function bulkMarkInvoiced(ids: string[]) {
  await withBulkEntries(ids, async (validIds, userId) => {
    await db
      .update(timeEntries)
      .set({ manuallyInvoiced: true })
      .where(
        and(
          inArray(timeEntries.id, validIds),
          eq(timeEntries.userId, userId),
          isNull(timeEntries.invoiceId),
        ),
      );
  });
}

export async function bulkUnmarkInvoiced(ids: string[]) {
  await withBulkEntries(ids, async (validIds, userId) => {
    await db
      .update(timeEntries)
      .set({ manuallyInvoiced: false })
      .where(
        and(
          inArray(timeEntries.id, validIds),
          eq(timeEntries.userId, userId),
          isNull(timeEntries.invoiceId),
        ),
      );
  });
}

export async function bulkDeleteEntries(ids: string[]) {
  await withBulkEntries(ids, async (validIds, userId) => {
    await db
      .delete(timeEntries)
      .where(
        and(
          inArray(timeEntries.id, validIds),
          eq(timeEntries.userId, userId),
          isNull(timeEntries.invoiceId),
          eq(timeEntries.manuallyInvoiced, false),
        ),
      );
  });
}
