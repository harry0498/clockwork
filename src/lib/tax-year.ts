/**
 * UK tax year runs 6 April – 5 April.
 * e.g. "2025/26" = 6 Apr 2025 to 5 Apr 2026
 */

export function getTaxYearBounds(startYear: number): {
	start: string;
	end: string;
	label: string;
} {
	return {
		start: `${startYear}-04-06`,
		end: `${startYear + 1}-04-05`,
		label: `${startYear}/${(startYear + 1).toString().slice(2)}`,
	};
}

export function getCurrentTaxYearStart(): number {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	// Before 6 April → previous tax year
	if (month < 4 || (month === 4 && day < 6)) {
		return year - 1;
	}
	return year;
}

export function getAvailableTaxYears(): Array<{
	value: number;
	label: string;
}> {
	const current = getCurrentTaxYearStart();
	const years = [];
	for (let y = current; y >= current - 5; y--) {
		years.push({
			value: y,
			label: getTaxYearBounds(y).label,
		});
	}
	return years;
}

export function formatMinutes(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}

export function formatGBP(amount: number | string): string {
	const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
	return `£${num.toFixed(2)}`;
}
