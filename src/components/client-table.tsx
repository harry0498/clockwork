"use client";

import { deleteClient } from "@/actions/clients";
import { ActionMenu } from "@/components/action-menu";
import { type Column, DataTable } from "@/components/data-table";
import { formatGBP, formatMinutes } from "@/lib/tax-year";

interface ClientWithStats {
  id: string;
  name: string;
  email: string | null;
  totalMinutes: number;
  totalEarned: number;
  unbilledAmount: number;
}

export function ClientTable({ clients }: { clients: ClientWithStats[] }) {
  const columns: Column<ClientWithStats>[] = [
    { header: "Name", accessor: "name", className: "font-medium" },
    {
      header: "Email",
      accessor: (c) => (
        <span className="text-muted-foreground">{c.email || "\u2014"}</span>
      ),
    },
    {
      header: "Total Hours",
      accessor: (c) => formatMinutes(c.totalMinutes),
      align: "right",
    },
    {
      header: "Total Earned",
      accessor: (c) => formatGBP(c.totalEarned),
      align: "right",
    },
    {
      header: "Unbilled",
      accessor: (c) => formatGBP(c.unbilledAmount),
      align: "right",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={clients}
      keyExtractor={(c) => c.id}
      actions={(c) => (
        <ActionMenu
          items={[
            { label: "Edit", href: `/clients/new?id=${c.id}` },
            {
              label: "Delete",
              onClick: () => deleteClient(c.id),
              variant: "destructive",
              confirm: `Delete client "${c.name}"? This cannot be undone.`,
            },
          ]}
        />
      )}
    />
  );
}
