"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/filter-select";
import { getPeriodBounds, type PeriodType, shiftPeriod } from "@/lib/tax-year";

const periodOptions = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "taxYear", label: "Tax Year" },
] as const;

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
    params.delete("taxYear");
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleShift(direction: 1 | -1) {
    const newRef = shiftPeriod(period, bounds.ref, direction);
    navigate(period, newRef);
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-end sm:gap-4 lg:col-span-1">
      <FilterSelect
        label="View by"
        value={period}
        onChange={(v) => navigate(v as PeriodType)}
        options={[...periodOptions]}
      />
      <div className="flex-1 sm:flex-initial">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Period
        </span>
        <div className="flex h-9 items-center rounded-lg border border-border bg-card shadow-sm">
          <button
            type="button"
            onClick={() => handleShift(-1)}
            className="inline-flex h-full w-8 items-center justify-center rounded-l-lg transition-colors hover:bg-accent"
            aria-label="Previous period"
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div className="h-full w-px bg-border" />
          <span className="min-w-[9rem] flex-1 px-3 text-center text-sm font-medium sm:flex-initial">
            {bounds.label}
          </span>
          <div className="h-full w-px bg-border" />
          <button
            type="button"
            onClick={() => handleShift(1)}
            className="inline-flex h-full w-8 items-center justify-center rounded-r-lg transition-colors hover:bg-accent"
            aria-label="Next period"
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
