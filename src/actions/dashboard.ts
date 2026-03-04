"use server";

import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { timeEntries } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { getCurrentTaxYearStart, getTaxYearBounds } from "@/lib/tax-year";

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
		.where(and(baseWhere, isNull(timeEntries.invoiceId)));

	return {
		totalMinutes: Number(allStats.totalMinutes),
		totalEarned: Number(allStats.totalEarned),
		unbilledMinutes: Number(unbilledStats.unbilledMinutes),
		unbilledAmount: Number(unbilledStats.unbilledAmount),
	};
}
