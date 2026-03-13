"use client";

import { FilterSelect } from "@/components/filter-select";
import { useFilterParam } from "@/lib/hooks/use-filter-param";
import { getAvailableTaxYears } from "@/lib/tax-year";

export function TaxYearFilter({ basePath }: { basePath: string }) {
  const [currentYear, handleChange] = useFilterParam("taxYear", basePath);
  const years = getAvailableTaxYears();

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
