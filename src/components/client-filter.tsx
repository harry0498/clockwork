"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/filter-select";

export function ClientFilterClient({
  clients,
  basePath,
  currentClientId,
}: {
  clients: Array<{ id: string; name: string }>;
  basePath: string;
  currentClientId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("clientId", value);
    } else {
      params.delete("clientId");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <FilterSelect
      label="Client"
      value={currentClientId ?? ""}
      onChange={handleChange}
      isFiltered={!!currentClientId}
      options={[
        { value: "", label: "All clients" },
        ...clients.map((c) => ({ value: c.id, label: c.name })),
      ]}
    />
  );
}
