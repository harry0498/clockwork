import { getClients } from "@/actions/clients";
import { getEntries } from "@/actions/entries";
import { ClientFilterClient } from "@/components/client-filter";
import { EntriesPageClient } from "@/components/entries-page-client";
import { TaxYearFilter } from "@/components/tax-year-filter";
import { getCurrentTaxYearStart } from "@/lib/tax-year";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ taxYear?: string; clientId?: string }>;
}) {
  const params = await searchParams;
  const taxYear = params.taxYear
    ? Number.parseInt(params.taxYear, 10)
    : getCurrentTaxYearStart();
  const clientId = params.clientId;

  const [entries, clients] = await Promise.all([
    getEntries({ taxYear, clientId, sortBy: "date", sortDir: "desc" }),
    getClients(),
  ]);

  return (
    <EntriesPageClient entries={entries} clients={clients}>
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
