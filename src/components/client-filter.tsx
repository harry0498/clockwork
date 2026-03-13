"use client";

import { FilterSelect } from "@/components/filter-select";
import { useFilterParam } from "@/lib/hooks/use-filter-param";

export function ClientFilterClient({
  clients,
  basePath,
  currentClientId,
}: {
  clients: Array<{ id: string; name: string }>;
  basePath: string;
  currentClientId?: string;
}) {
  const [, handleChange] = useFilterParam("clientId", basePath);

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
