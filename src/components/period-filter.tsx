"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getPeriodBounds, type PeriodType, shiftPeriod } from "@/lib/tax-year";

const periodLabels: Record<PeriodType, string> = {
  month: "Month",
  week: "Week",
  taxYear: "Tax Year",
};

const periodTypes: PeriodType[] = ["month", "week", "taxYear"];

export function PeriodFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const period = (
    periodTypes.includes(searchParams.get("period") as PeriodType)
      ? searchParams.get("period")
      : "month"
  ) as PeriodType;
  const ref = searchParams.get("ref") ?? undefined;
  const bounds = getPeriodBounds(period, ref);

  function navigate(newPeriod: PeriodType, newRef?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", newPeriod);
    if (newRef) {
      params.set("ref", newRef);
    } else {
      params.delete("ref");
    }
    params.delete("page");
    // Clean up legacy taxYear param
    params.delete("taxYear");
    router.push(`${basePath}?${params.toString()}`);
  }

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate(e.target.value as PeriodType);
  }

  function handleShift(direction: 1 | -1) {
    const newRef = shiftPeriod(period, bounds.ref, direction);
    navigate(period, newRef);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={period}
        onChange={handlePeriodChange}
        className="filter-select rounded-lg border border-input bg-background py-2.5 pl-3 pr-8 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        {periodTypes.map((p) => (
          <option key={p} value={p}>
            {periodLabels[p]}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleShift(-1)}
          className="inline-flex h-10 w-8 items-center justify-center rounded-lg border border-input bg-background text-sm transition-colors hover:bg-accent"
          aria-label="Previous period"
        >
          ‹
        </button>
        <span className="min-w-[8rem] text-center text-sm font-medium">
          {bounds.label}
        </span>
        <button
          type="button"
          onClick={() => handleShift(1)}
          className="inline-flex h-10 w-8 items-center justify-center rounded-lg border border-input bg-background text-sm transition-colors hover:bg-accent"
          aria-label="Next period"
        >
          ›
        </button>
      </div>
    </div>
  );
}
