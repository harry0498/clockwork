"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/filter-select";
import { getAvailableTaxYears } from "@/lib/tax-year";

export function TaxYearFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = searchParams.get("taxYear");
  const years = getAvailableTaxYears();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("taxYear", value);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <FilterSelect
      label="Tax Year"
      value={currentYear ?? years[0]?.value.toString()}
      onChange={handleChange}
      options={years.map((y) => ({
        value: y.value.toString(),
        label: y.label,
      }))}
    />
  );
}
