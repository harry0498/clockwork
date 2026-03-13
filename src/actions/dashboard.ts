"use server";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { clients, invoices, timeEntries } from "@/db/schema";
import { getBillingStats } from "@/lib/billing-stats";
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

  if (!baseWhere) throw new Error("Invalid query conditions");
  return getBillingStats(baseWhere, { includeManualInPaid: true });
}
