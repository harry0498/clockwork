"use server";

import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
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
  const paidMinutes =
    Number(paidStats.paidMinutes) + Number(manualStats.manualMinutes);
  const paidAmount =
    Number(paidStats.paidAmount) + Number(manualStats.manualAmount);

  return {
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
