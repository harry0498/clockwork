import { getClients } from "@/actions/clients";
import { getUninvoicedEntriesForClient } from "@/actions/entries";
import { getInvoices } from "@/actions/invoices";
import { InvoicesPageClient } from "@/components/invoices-page-client";
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

  const [invoiceList, clients] = await Promise.all([
    getInvoices(taxYear),
    getClients(),
  ]);

  return (
    <InvoicesPageClient
      invoices={invoiceList}
      clients={clients}
      getEntriesForClient={getUninvoicedEntriesForClient}
    >
      <TaxYearFilter basePath="/invoices" />
    </InvoicesPageClient>
  );
}
