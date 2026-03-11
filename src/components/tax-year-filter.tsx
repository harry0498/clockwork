"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getAvailableTaxYears } from "@/lib/tax-year";

export function TaxYearFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = searchParams.get("taxYear");
  const years = getAvailableTaxYears();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("taxYear", e.target.value);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={currentYear ?? years[0]?.value.toString()}
      onChange={handleChange}
      className="filter-select rounded-lg border border-input bg-background py-2.5 pl-3 pr-8 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
    >
      {years.map((y) => (
        <option key={y.value} value={y.value}>
          {y.label}
        </option>
      ))}
    </select>
  );
}
