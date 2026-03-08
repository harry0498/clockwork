import { notFound } from "next/navigation";
import { getInvoice } from "@/actions/invoices";
import { DataTable } from "@/components/data-table";
import { InvoiceStatusToggle } from "@/components/invoice-status-toggle";
import { DownloadPdfButton } from "@/components/invoice-table";
import { calculateAmount, formatGBP, formatMinutes } from "@/lib/tax-year";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">{invoice.client.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InvoiceStatusToggle
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
          <DownloadPdfButton invoiceId={invoice.id} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Issued</p>
          <p className="font-medium">{invoice.issuedAt}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{formatGBP(invoice.totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="font-medium">{invoice.paidAt ?? "—"}</p>
        </div>
      </div>

      {invoice.client.addressLine1 && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Bill To</p>
          <p className="font-medium">{invoice.client.name}</p>
          {invoice.client.email && (
            <p className="text-sm text-muted-foreground">
              {invoice.client.email}
            </p>
          )}
          <div className="text-sm mt-1">
            <p>{invoice.client.addressLine1}</p>
            {invoice.client.addressLine2 && (
              <p>{invoice.client.addressLine2}</p>
            )}
            <p>
              {[invoice.client.county, invoice.client.postcode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={[
          { header: "Date", accessor: "date" },
          { header: "Description", accessor: "title" },
          {
            header: "Time",
            accessor: (e) => formatMinutes(e.minutes),
            align: "right",
          },
          {
            header: "Rate",
            accessor: (e) => `${formatGBP(e.ratePerHour)}/hr`,
            align: "right",
          },
          {
            header: "Amount",
            accessor: (e) =>
              formatGBP(calculateAmount(e.minutes, e.ratePerHour)),
            align: "right",
            className: "font-medium",
          },
        ]}
        data={invoice.timeEntries}
        keyExtractor={(e) => e.id}
        footer={
          <tr className="border-t border-border bg-muted/50">
            <td colSpan={4} className="px-4 py-3 text-right font-bold">
              Total
            </td>
            <td className="px-4 py-3 text-right font-bold">
              {formatGBP(invoice.totalAmount)}
            </td>
          </tr>
        }
      />
    </div>
  );
}
