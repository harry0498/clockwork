import { getClients } from "@/actions/clients";
import { getEntriesPaginated } from "@/actions/entries";
import { ClientFilterClient } from "@/components/client-filter";
import { EntriesPageClient } from "@/components/entries-page-client";
import { InvoicedFilter } from "@/components/invoiced-filter";
import { PeriodFilter } from "@/components/period-filter";
import { parsePage, parseSort } from "@/lib/pagination";
import { getPeriodBounds, type PeriodType } from "@/lib/tax-year";

const validPeriods: PeriodType[] = ["month", "week", "taxYear"];

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    ref?: string;
    clientId?: string;
    invoiced?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const params = await searchParams;
  const period = validPeriods.includes(params.period as PeriodType)
    ? (params.period as PeriodType)
    : "month";
  const bounds = getPeriodBounds(period, params.ref);
  const clientId = params.clientId;
  const invoicedStatus =
    params.invoiced === "all" || params.invoiced === "invoiced"
      ? params.invoiced
      : "uninvoiced";
  const { page, offset } = parsePage(params);
  const { sort, dir } = parseSort(
    params,
    ["date", "title", "amount"] as const,
    "date",
  );

  const [result, clients] = await Promise.all([
    getEntriesPaginated({
      dateStart: bounds.start,
      dateEnd: bounds.end,
      clientId,
      invoicedStatus,
      page,
      offset,
      sortBy: sort,
      sortDir: dir,
    }),
    getClients(),
  ]);

  return (
    <EntriesPageClient
      entries={result.data}
      clients={clients}
      pagination={{ currentPage: result.page, pageCount: result.pageCount }}
      sorting={{ sort, dir }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <PeriodFilter basePath="/entries" />
        <ClientFilterClient
          clients={clients}
          basePath="/entries"
          currentClientId={clientId}
        />
        <InvoicedFilter basePath="/entries" />
      </div>
    </EntriesPageClient>
  );
}
