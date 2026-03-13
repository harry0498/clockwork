"use client";

import Link from "next/link";
import { ActionMenu } from "@/components/action-menu";
import { type Column, DataTable } from "@/components/data-table";
import { buttonSecondaryClassName } from "@/lib/constants";
import { formatGBP } from "@/lib/tax-year";
import type { InvoiceWithClient } from "@/lib/types";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-indigo-100 text-indigo-700",
  paid: "bg-emerald-100 text-emerald-700",
};

async function downloadInvoicePdf(invoiceId: string) {
  const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
  if (!res.ok) throw new Error("Failed to download PDF");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const disposition = res.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="?(.+?)"?$/);
  a.download = filenameMatch?.[1] ?? `invoice-${invoiceId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function InvoiceTable({
  invoices,
  onDelete,
  pagination,
  sorting,
}: {
  invoices: InvoiceWithClient[];
  onDelete?: (invoice: InvoiceWithClient) => void;
  pagination?: { currentPage: number; pageCount: number };
  sorting?: { sort: string; dir: "asc" | "desc" };
}) {
  const columns: Column<InvoiceWithClient>[] = [
    {
      header: "Number",
      sortKey: "number",
      accessor: (inv) => (
        <Link
          href={`/invoices/${inv.id}`}
          className="font-medium hover:underline"
        >
          {inv.invoiceNumber}
        </Link>
      ),
    },
    {
      header: "Client",
      accessor: (inv) => (
        <Link href={`/clients/${inv.client.id}`} className="hover:underline">
          {inv.client.name}
        </Link>
      ),
    },
    {
      header: "Date",
      accessor: "issuedAt",
      hideOnMobile: true,
      sortKey: "date",
    },
    {
      header: "Total",
      accessor: (inv) => formatGBP(inv.totalAmount),
      align: "right",
      className: "font-medium",
      sortKey: "total",
    },
    {
      header: "Status",
      align: "center",
      accessor: (inv) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[inv.status]}`}
        >
          {inv.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      keyExtractor={(inv) => inv.id}
      pagination={pagination}
      sorting={sorting ? { sort: sorting.sort, dir: sorting.dir } : undefined}
      actions={(inv) => (
        <ActionMenu
          items={[
            { label: "View", href: `/invoices/${inv.id}` },
            {
              label: "Download PDF",
              onClick: () => downloadInvoicePdf(inv.id),
            },
            {
              label: "Delete",
              onClick: onDelete ? () => onDelete(inv) : undefined,
              variant: "destructive",
            },
          ]}
        />
      )}
    />
  );
}

export function DownloadPdfButton({ invoiceId }: { invoiceId: string }) {
  return (
    <button
      type="button"
      onClick={() => downloadInvoicePdf(invoiceId)}
      className={buttonSecondaryClassName}
    >
      Download PDF
    </button>
  );
}
