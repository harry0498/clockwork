"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients, invoices, timeEntries } from "@/db/schema";
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
      unbilledAmount: sql<number>`coalesce(sum(case when ${timeEntries.invoiceId} is null and ${timeEntries.manuallyInvoiced} = false then ${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0 else 0 end), 0)`,
    })
    .from(clients)
    .leftJoin(timeEntries, eq(clients.id, timeEntries.clientId))
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

  const [unbilledStats] = await db
    .select({
      unbilledMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      unbilledAmount: sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`,
    })
    .from(timeEntries)
    .where(
      and(
        baseWhere,
        isNull(timeEntries.invoiceId),
        eq(timeEntries.manuallyInvoiced, false),
      ),
    );

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
  const unbilledMinutes = Number(unbilledStats.unbilledMinutes);
  const unbilledAmount = Number(unbilledStats.unbilledAmount);
  const billedMinutes = totalMinutes - unbilledMinutes;
  const billedAmount = totalEarned - unbilledAmount;
  const paidMinutes = Number(paidStats.paidMinutes);
  const paidAmount = Number(paidStats.paidAmount);

  return {
    ...client,
    totalMinutes,
    totalEarned,
    unbilledMinutes,
    unbilledAmount,
    billedMinutes,
    billedAmount,
    paidMinutes,
    paidAmount,
    unpaidMinutes: billedMinutes - paidMinutes,
    unpaidAmount: billedAmount - paidAmount,
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
