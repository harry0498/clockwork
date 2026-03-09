import { getClients } from "@/actions/clients";
import { getUninvoicedEntriesForClient } from "@/actions/entries";
import { getInvoicesPaginated } from "@/actions/invoices";
import { InvoicesPageClient } from "@/components/invoices-page-client";
import { TaxYearFilter } from "@/components/tax-year-filter";
import { parsePage } from "@/lib/pagination";
import { getCurrentTaxYearStart } from "@/lib/tax-year";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ taxYear?: string; page?: string }>;
}) {
  const params = await searchParams;
  const taxYear = params.taxYear
    ? Number.parseInt(params.taxYear, 10)
    : getCurrentTaxYearStart();
  const { page, offset } = parsePage(params);

  const [result, clients] = await Promise.all([
    getInvoicesPaginated(taxYear, { page, offset }),
    getClients(),
  ]);

  return (
    <InvoicesPageClient
      invoices={result.data}
      clients={clients}
      getEntriesForClient={getUninvoicedEntriesForClient}
      pagination={{ currentPage: result.page, pageCount: result.pageCount }}
    >
      <TaxYearFilter basePath="/invoices" />
    </InvoicesPageClient>
  );
}
