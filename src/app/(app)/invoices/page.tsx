import { getClients } from "@/actions/clients";
import { getUninvoicedEntriesForClient } from "@/actions/entries";
import { getInvoicesPaginated } from "@/actions/invoices";
import { ClientFilterClient } from "@/components/client-filter";
import { InvoicesPageClient } from "@/components/invoices-page-client";
import { StatusFilter } from "@/components/status-filter";
import { TaxYearFilter } from "@/components/tax-year-filter";
import { parsePage, parseSort } from "@/lib/pagination";
import { getCurrentTaxYearStart } from "@/lib/tax-year";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    taxYear?: string;
    page?: string;
    clientId?: string;
    status?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const params = await searchParams;
  const taxYear = params.taxYear
    ? Number.parseInt(params.taxYear, 10)
    : getCurrentTaxYearStart();
  const { page, offset } = parsePage(params);
  const { sort, dir } = parseSort(
    params,
    ["number", "date", "total"] as const,
    "date",
  );

  const [result, clients] = await Promise.all([
    getInvoicesPaginated(taxYear, {
      page,
      offset,
      clientId: params.clientId,
      status: params.status,
      sortBy: sort,
      sortDir: dir,
    }),
    getClients(),
  ]);

  return (
    <InvoicesPageClient
      invoices={result.data}
      clients={clients}
      getEntriesForClient={getUninvoicedEntriesForClient}
      pagination={{ currentPage: result.page, pageCount: result.pageCount }}
      sorting={{ sort, dir }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <TaxYearFilter basePath="/invoices" />
        <ClientFilterClient
          clients={clients}
          basePath="/invoices"
          currentClientId={params.clientId}
        />
        <StatusFilter basePath="/invoices" />
      </div>
    </InvoicesPageClient>
  );
}
