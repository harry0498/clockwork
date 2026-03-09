"use client";

import Link from "next/link";
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

export function ClientTable({
  clients,
  onEdit,
  onDelete,
  pagination,
}: {
  clients: ClientWithStats[];
  onEdit?: (client: ClientWithStats) => void;
  onDelete?: (client: ClientWithStats) => void;
  pagination?: { currentPage: number; pageCount: number };
}) {
  const columns: Column<ClientWithStats>[] = [
    {
      header: "Name",
      accessor: (e) => (
        <Link href={`/clients/${e.id}`} className="hover:underline">
          {e.name}
        </Link>
      ),
      className: "font-medium",
    },
    {
      header: "Email",
      accessor: (c) => (
        <span className="text-muted-foreground">{c.email || "\u2014"}</span>
      ),
      hideOnMobile: true,
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
      hideOnMobile: true,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={clients}
      keyExtractor={(c) => c.id}
      pagination={pagination}
      actions={(c) => (
        <ActionMenu
          items={[
            {
              label: "Edit",
              onClick: onEdit ? () => onEdit(c) : undefined,
              href: onEdit ? undefined : `/clients/${c.id}/edit`,
            },
            {
              label: "Delete",
              onClick: onDelete ? () => onDelete(c) : undefined,
              variant: "destructive",
            },
          ]}
        />
      )}
    />
  );
}
