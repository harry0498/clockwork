"use client";

import { useRouter, useSearchParams } from "next/navigation";

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

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("clientId", e.target.value);
    } else {
      params.delete("clientId");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <select
      value={currentClientId ?? ""}
      onChange={handleChange}
      className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30"
    >
      <option value="">All clients</option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
