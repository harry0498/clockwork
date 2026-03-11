"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/filter-select";

const statuses = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
] as const;

export function StatusFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <FilterSelect
      label="Status"
      value={currentStatus}
      onChange={handleChange}
      isFiltered={!!currentStatus}
      options={[...statuses]}
    />
  );
}
