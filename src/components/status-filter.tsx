"use client";

import { FilterSelect } from "@/components/filter-select";
import { useFilterParam } from "@/lib/hooks/use-filter-param";

const statuses = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
] as const;

export function StatusFilter({ basePath }: { basePath: string }) {
  const [currentStatus, handleChange] = useFilterParam("status", basePath);

  return (
    <FilterSelect
      label="Status"
      value={currentStatus ?? ""}
      onChange={handleChange}
      isFiltered={!!currentStatus}
      options={[...statuses]}
    />
  );
}
