import Link from "next/link";
import { getInvoices } from "@/actions/invoices";
import { EmptyState } from "@/components/empty-state";
import { InvoiceTable } from "@/components/invoice-table";
import { TaxYearFilter } from "@/components/tax-year-filter";
import { getCurrentTaxYearStart } from "@/lib/tax-year";

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
        <InvoiceTable invoices={invoiceList} />
      )}
    </div>
  );
}
