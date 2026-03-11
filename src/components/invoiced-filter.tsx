"use client";

import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "uninvoiced", label: "Not invoiced" },
  { value: "all", label: "All entries" },
  { value: "invoiced", label: "Invoiced" },
] as const;

export function InvoicedFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("invoiced") ?? "uninvoiced";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "uninvoiced") {
      params.delete("invoiced");
    } else {
      params.set("invoiced", e.target.value);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="filter-select rounded-lg border border-input bg-background py-2.5 pl-3 pr-8 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
