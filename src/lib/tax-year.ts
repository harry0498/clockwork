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

export function calculateAmount(minutes: number, ratePerHour: string): number {
  return (minutes / 60) * Number.parseFloat(ratePerHour);
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// --- Period helpers (month / week / tax year) ---

export type PeriodType = "month" | "week" | "taxYear";

export interface PeriodBounds {
  start: string;
  end: string;
  label: string;
  /** Opaque key that encodes this period for URL param */
  ref: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getMonthBounds(year: number, month: number): PeriodBounds {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // last day of month
  const label = start.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  return {
    start: isoDate(start),
    end: isoDate(end),
    label,
    ref: `${year}-${pad(month)}`,
  };
}

function getMondayOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday=1
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function getWeekBounds(refDate: Date): PeriodBounds {
  const monday = getMondayOfWeek(refDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const startLabel = monday.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const endLabel = sunday.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return {
    start: isoDate(monday),
    end: isoDate(sunday),
    label: `${startLabel} – ${endLabel}`,
    ref: isoDate(monday),
  };
}

export function getPeriodBounds(
  period: PeriodType,
  ref?: string,
): PeriodBounds {
  const now = new Date();

  switch (period) {
    case "month": {
      if (ref && /^\d{4}-\d{2}$/.test(ref)) {
        const [y, m] = ref.split("-").map(Number);
        return getMonthBounds(y, m);
      }
      return getMonthBounds(now.getFullYear(), now.getMonth() + 1);
    }
    case "week": {
      if (ref && /^\d{4}-\d{2}-\d{2}$/.test(ref)) {
        return getWeekBounds(new Date(`${ref}T12:00:00`));
      }
      return getWeekBounds(now);
    }
    case "taxYear": {
      const year = ref ? Number.parseInt(ref, 10) : getCurrentTaxYearStart();
      const bounds = getTaxYearBounds(year);
      return { ...bounds, ref: String(year) };
    }
  }
}

export function shiftPeriod(
  period: PeriodType,
  ref: string,
  direction: 1 | -1,
): string {
  switch (period) {
    case "month": {
      const [y, m] = ref.split("-").map(Number);
      const d = new Date(y, m - 1 + direction, 1);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    }
    case "week": {
      const d = new Date(`${ref}T12:00:00`);
      d.setDate(d.getDate() + direction * 7);
      return isoDate(getMondayOfWeek(d));
    }
    case "taxYear": {
      return String(Number.parseInt(ref, 10) + direction);
    }
  }
}
