"use server";

import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { clients, invoices, timeEntries } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { getCurrentTaxYearStart, getTaxYearBounds } from "@/lib/tax-year";

export async function getOnboardingStatus() {
  const session = await requireSession();
  const userId = session.user.id;

  const [result] = await db
    .select({
      hasClients: sql<boolean>`exists(select 1 from ${clients} where ${clients.userId} = ${userId})`,
      hasEntries: sql<boolean>`exists(select 1 from ${timeEntries} where ${timeEntries.userId} = ${userId})`,
      hasInvoices: sql<boolean>`exists(select 1 from ${invoices} where ${invoices.userId} = ${userId})`,
    })
    .from(sql`(select 1) as _`);

  return {
    hasClients: Boolean(result.hasClients),
    hasEntries: Boolean(result.hasEntries),
    hasInvoices: Boolean(result.hasInvoices),
  };
}

export async function getDashboardStats() {
  const session = await requireSession();
  const bounds = getTaxYearBounds(getCurrentTaxYearStart());

  const baseWhere = and(
    eq(timeEntries.userId, session.user.id),
    gte(timeEntries.date, bounds.start),
    lte(timeEntries.date, bounds.end),
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
