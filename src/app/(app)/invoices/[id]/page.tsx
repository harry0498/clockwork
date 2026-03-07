import { notFound } from "next/navigation";
import { getInvoice } from "@/actions/invoices";
import { InvoiceStatusToggle } from "@/components/invoice-status-toggle";
import { formatGBP, formatMinutes } from "@/lib/tax-year";

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
        <div className="flex items-center gap-3">
          <InvoiceStatusToggle
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Download PDF
          </a>
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

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Time</th>
              <th className="px-4 py-3 text-right font-medium">Rate</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.timeEntries.map((entry) => {
              const amount =
                (entry.minutes / 60) * Number.parseFloat(entry.ratePerHour);
              return (
                <tr
                  key={entry.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.title}</td>
                  <td className="px-4 py-3 text-right">
                    {formatMinutes(entry.minutes)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatGBP(entry.ratePerHour)}/hr
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatGBP(amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/50">
              <td colSpan={4} className="px-4 py-3 text-right font-bold">
                Total
              </td>
              <td className="px-4 py-3 text-right font-bold">
                {formatGBP(invoice.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
