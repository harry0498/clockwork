"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/filter-select";

const options = [
  { value: "uninvoiced", label: "Not invoiced" },
  { value: "all", label: "All entries" },
  { value: "invoiced", label: "Invoiced" },
] as const;

export function InvoicedFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("invoiced") ?? "uninvoiced";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "uninvoiced") {
      params.delete("invoiced");
    } else {
      params.set("invoiced", value);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <FilterSelect
      label="Invoice Status"
      value={current}
      onChange={handleChange}
      isFiltered={current !== "uninvoiced"}
      options={[...options]}
    />
  );
}
