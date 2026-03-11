"use server";

import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients, invoices, timeEntries } from "@/db/schema";
import { PAGE_SIZE, type PaginatedResult } from "@/lib/pagination";
import { requireSession } from "@/lib/session";
import { type ClientInput, clientSchema } from "@/lib/validators";

export async function getClients() {
  const session = await requireSession();
  return db.query.clients.findMany({
    where: eq(clients.userId, session.user.id),
    orderBy: (clients, { asc }) => [asc(clients.name)],
  });
}

export async function getClientsWithStats() {
  const session = await requireSession();

  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      totalEarned: sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`,
      unbilledAmount: sql<number>`coalesce(sum(case when (${timeEntries.invoiceId} is null or ${invoices.status} = 'draft') and ${timeEntries.manuallyInvoiced} = false then ${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0 else 0 end), 0)`,
    })
    .from(clients)
    .leftJoin(timeEntries, eq(clients.id, timeEntries.clientId))
    .leftJoin(invoices, eq(timeEntries.invoiceId, invoices.id))
    .where(eq(clients.userId, session.user.id))
    .groupBy(clients.id, clients.name, clients.email)
    .orderBy(clients.name);

  return rows.map((row) => ({
    ...row,
    totalMinutes: Number(row.totalMinutes),
    totalEarned: Number(row.totalEarned),
    unbilledAmount: Number(row.unbilledAmount),
  }));
}

interface ClientWithStats {
  id: string;
  name: string;
  email: string | null;
  totalMinutes: number;
  totalEarned: number;
  unbilledAmount: number;
}

export async function getClientsWithStatsPaginated(options: {
  page: number;
  offset: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "totalEarned" | "unbilled";
  sortDir?: "asc" | "desc";
}): Promise<PaginatedResult<ClientWithStats>> {
  const session = await requireSession();
  const limit = options.limit ?? PAGE_SIZE;

  const conditions = [eq(clients.userId, session.user.id)];
  if (options.search) {
    conditions.push(ilike(clients.name, `%${options.search}%`));
  }
  const whereClause = and(...conditions);

  const totalEarnedExpr = sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`;
  const unbilledExpr = sql<number>`coalesce(sum(case when (${timeEntries.invoiceId} is null or ${invoices.status} = 'draft') and ${timeEntries.manuallyInvoiced} = false then ${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0 else 0 end), 0)`;

  const sortFn = options.sortDir === "desc" ? desc : asc;
  let orderExpr: Parameters<typeof asc>[0];
  switch (options.sortBy) {
    case "totalEarned":
      orderExpr = totalEarnedExpr;
      break;
    case "unbilled":
      orderExpr = unbilledExpr;
      break;
    default:
      orderExpr = clients.name;
  }

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        totalMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
        totalEarned: totalEarnedExpr,
        unbilledAmount: unbilledExpr,
      })
      .from(clients)
      .leftJoin(timeEntries, eq(clients.id, timeEntries.clientId))
      .leftJoin(invoices, eq(timeEntries.invoiceId, invoices.id))
      .where(whereClause)
      .groupBy(clients.id, clients.name, clients.email)
      .orderBy(sortFn(orderExpr))
      .limit(limit)
      .offset(options.offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(whereClause),
  ]);

  const total = Number(count);
  return {
    data: rows.map((row) => ({
      ...row,
      totalMinutes: Number(row.totalMinutes),
      totalEarned: Number(row.totalEarned),
      unbilledAmount: Number(row.unbilledAmount),
    })),
    total,
    page: options.page,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getClient(id: string) {
  const session = await requireSession();
  return db.query.clients.findFirst({
    where: and(eq(clients.id, id), eq(clients.userId, session.user.id)),
  });
}

export async function getClientWithStats(id: string) {
  const session = await requireSession();

  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, id), eq(clients.userId, session.user.id)),
  });

  if (!client) return null;

  const baseWhere = and(
    eq(timeEntries.clientId, id),
    eq(timeEntries.userId, session.user.id),
  );

  const [allStats] = await db
    .select({
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      totalEarned: sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`,
    })
    .from(timeEntries)
    .where(baseWhere);

  const [billedStats] = await db
    .select({
      billedMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      billedAmount: sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`,
    })
    .from(timeEntries)
    .innerJoin(invoices, eq(timeEntries.invoiceId, invoices.id))
    .where(and(baseWhere, inArray(invoices.status, ["sent", "paid"])));

  const [manualStats] = await db
    .select({
      manualMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      manualAmount: sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`,
    })
    .from(timeEntries)
    .where(and(baseWhere, eq(timeEntries.manuallyInvoiced, true)));

  const [paidStats] = await db
    .select({
      paidMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      paidAmount: sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`,
    })
    .from(timeEntries)
    .innerJoin(invoices, eq(timeEntries.invoiceId, invoices.id))
    .where(and(baseWhere, eq(invoices.status, "paid")));

  const totalMinutes = Number(allStats.totalMinutes);
  const totalEarned = Number(allStats.totalEarned);
  const billedMinutes =
    Number(billedStats.billedMinutes) + Number(manualStats.manualMinutes);
  const billedAmount =
    Number(billedStats.billedAmount) + Number(manualStats.manualAmount);
  const paidMinutes = Number(paidStats.paidMinutes);
  const paidAmount = Number(paidStats.paidAmount);

  return {
    ...client,
    totalMinutes,
    totalEarned,
    unbilledMinutes: totalMinutes - billedMinutes,
    unbilledAmount: totalEarned - billedAmount,
    billedMinutes,
    billedAmount,
    paidMinutes,
    paidAmount,
  };
}

function clientFieldsToValues(data: ClientInput) {
  return {
    name: data.name,
    email: data.email || null,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2 || null,
    county: data.county,
    postcode: data.postcode,
    vatNumber: data.vatNumber || null,
  };
}

export async function createClient(input: ClientInput) {
  const session = await requireSession();
  const data = clientSchema.parse(input);

  await db.insert(clients).values({
    userId: session.user.id,
    ...clientFieldsToValues(data),
  });

  revalidatePath("/clients");
}

export async function updateClient(id: string, input: ClientInput) {
  const session = await requireSession();
  const data = clientSchema.parse(input);

  await db
    .update(clients)
    .set(clientFieldsToValues(data))
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)));

  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  const session = await requireSession();

  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)));

  revalidatePath("/clients");
}
