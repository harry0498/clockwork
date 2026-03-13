import type { SQL } from "drizzle-orm";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoices, timeEntries } from "@/db/schema";

export interface BillingStats {
  totalMinutes: number;
  totalEarned: number;
  billedMinutes: number;
  billedAmount: number;
  unbilledMinutes: number;
  unbilledAmount: number;
  paidMinutes: number;
  paidAmount: number;
}

export async function getBillingStats(
  baseWhere: SQL,
  options?: { includeManualInPaid?: boolean },
): Promise<BillingStats> {
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
  const manualMinutes = Number(manualStats.manualMinutes);
  const manualAmount = Number(manualStats.manualAmount);
  const paidMinutes =
    Number(paidStats.paidMinutes) +
    (options?.includeManualInPaid ? manualMinutes : 0);
  const paidAmount =
    Number(paidStats.paidAmount) +
    (options?.includeManualInPaid ? manualAmount : 0);

  return {
    totalMinutes,
    totalEarned,
    billedMinutes,
    billedAmount,
    unbilledMinutes: totalMinutes - billedMinutes,
    unbilledAmount: totalEarned - billedAmount,
    paidMinutes,
    paidAmount,
  };
}
