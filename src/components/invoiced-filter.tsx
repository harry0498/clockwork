"use client";

import { FilterSelect } from "@/components/filter-select";
import { useFilterParam } from "@/lib/hooks/use-filter-param";

const options = [
  { value: "uninvoiced", label: "Not invoiced" },
  { value: "all", label: "All entries" },
  { value: "invoiced", label: "Invoiced" },
] as const;

export function InvoicedFilter({ basePath }: { basePath: string }) {
  const [current, handleChange] = useFilterParam("invoiced", basePath, {
    defaultValue: "uninvoiced",
  });

  return (
    <FilterSelect
      label="Invoice Status"
      value={current ?? "uninvoiced"}
      onChange={handleChange}
      isFiltered={(current ?? "uninvoiced") !== "uninvoiced"}
      options={[...options]}
    />
  );
}
