"use client";

import Link from "next/link";
import { deleteEntry, toggleManuallyInvoiced } from "@/actions/entries";
import { ActionMenu } from "@/components/action-menu";
import { type Column, DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { calculateAmount, formatGBP, formatMinutes } from "@/lib/tax-year";
import type { TimeEntryWithClient } from "@/lib/types";

type Entry = Pick<
  TimeEntryWithClient,
  | "id"
  | "title"
  | "minutes"
  | "ratePerHour"
  | "date"
  | "invoiceId"
  | "manuallyInvoiced"
  | "client"
>;

export function EntryTable({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        message="No entries for this period."
        actionLabel="Log Time"
        actionHref="/entries/new"
      />
    );
  }

  const columns: Column<Entry>[] = [
    { header: "Date", accessor: "date" },
    {
      header: "Client",
      accessor: (e) => (
        <Link href={`/clients/${e.client.id}`} className="hover:underline">
          {e.client.name}
        </Link>
      ),
    },
    { header: "Title", accessor: "title", className: "font-medium" },
    {
      header: "Time",
      accessor: (e) => formatMinutes(e.minutes),
      align: "right",
    },
    {
      header: "Rate",
      accessor: (e) => `${formatGBP(e.ratePerHour)}/hr`,
      align: "right",
      hideOnMobile: true,
    },
    {
      header: "Amount",
      accessor: (e) => formatGBP(calculateAmount(e.minutes, e.ratePerHour)),
      align: "right",
      className: "font-medium",
      hideOnMobile: true,
    },
    {
      header: "Invoiced",
      align: "center",
      hideOnMobile: true,
      accessor: (e) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
            e.invoiceId || e.manuallyInvoiced
              ? "bg-green-100 text-green-800"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {e.invoiceId || e.manuallyInvoiced ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={entries}
      keyExtractor={(e) => e.id}
      actions={(entry) =>
        entry.invoiceId ? (
          <ActionMenu
            items={[
              {
                label: "View Invoice",
                href: `/invoices/${entry.invoiceId}`,
              },
            ]}
          />
        ) : (
          <ActionMenu
            items={[
              {
                label: "Edit",
                href: `/entries/new?id=${entry.id}`,
                hidden: entry.manuallyInvoiced,
              },
              {
                label: entry.manuallyInvoiced
                  ? "Unmark as invoiced"
                  : "Mark as Invoiced",
                onClick: () => toggleManuallyInvoiced(entry.id),
              },
              {
                label: "Delete",
                onClick: () => deleteEntry(entry.id),
                variant: "destructive",
                confirm: "Delete this entry?",
                hidden: entry.manuallyInvoiced,
              },
            ]}
          />
        )
      }
    />
  );
}
