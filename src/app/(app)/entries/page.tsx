import { getClients } from "@/actions/clients";
import { getEntriesPaginated } from "@/actions/entries";
import { ClientFilterClient } from "@/components/client-filter";
import { EntriesPageClient } from "@/components/entries-page-client";
import { TaxYearFilter } from "@/components/tax-year-filter";
import { parsePage } from "@/lib/pagination";
import { getCurrentTaxYearStart } from "@/lib/tax-year";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ taxYear?: string; clientId?: string; page?: string }>;
}) {
  const params = await searchParams;
  const taxYear = params.taxYear
    ? Number.parseInt(params.taxYear, 10)
    : getCurrentTaxYearStart();
  const clientId = params.clientId;
  const { page, offset } = parsePage(params);

  const [result, clients] = await Promise.all([
    getEntriesPaginated({
      taxYear,
      clientId,
      page,
      offset,
      sortBy: "date",
      sortDir: "desc",
    }),
    getClients(),
  ]);

  return (
    <EntriesPageClient
      entries={result.data}
      clients={clients}
      pagination={{ currentPage: result.page, pageCount: result.pageCount }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <TaxYearFilter basePath="/entries" />
        <ClientFilterClient
          clients={clients}
          basePath="/entries"
          currentClientId={clientId}
        />
      </div>
    </EntriesPageClient>
  );
}
