import Link from "next/link";
import { getInvoices } from "@/actions/invoices";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { TaxYearFilter } from "@/components/tax-year-filter";
import { formatGBP, getCurrentTaxYearStart } from "@/lib/tax-year";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ taxYear?: string }>;
}) {
  const params = await searchParams;
  const taxYear = params.taxYear
    ? Number.parseInt(params.taxYear, 10)
    : getCurrentTaxYearStart();

  const invoiceList = await getInvoices(taxYear);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Invoice
        </Link>
      </div>

      <TaxYearFilter basePath="/invoices" />

      {invoiceList.length === 0 ? (
        <EmptyState
          message="No invoices yet."
          actionLabel="Create Invoice"
          actionHref="/invoices/new"
        />
      ) : (
        <DataTable
          columns={[
            {
              header: "Number",
              accessor: (inv) => (
                <Link
                  href={`/invoices/${inv.id}`}
                  className="font-medium hover:underline"
                >
                  {inv.invoiceNumber}
                </Link>
              ),
            },
            { header: "Client", accessor: (inv) => inv.client.name },
            { header: "Date", accessor: "issuedAt" },
            {
              header: "Total",
              accessor: (inv) => formatGBP(inv.totalAmount),
              align: "right",
              className: "font-medium",
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
          ]}
          data={invoiceList}
          keyExtractor={(inv) => inv.id}
        />
      )}
    </div>
  );
}
