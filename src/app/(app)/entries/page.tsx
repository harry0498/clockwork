import Link from "next/link";
import { getClients } from "@/actions/clients";
import { getEntries } from "@/actions/entries";
import { ClientFilterClient } from "@/components/client-filter";
import { EntryTable } from "@/components/entry-table";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time Entries</h1>
        <Link
          href="/entries/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Entry
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <TaxYearFilter basePath="/entries" />
        <ClientFilterClient
          clients={clients}
          basePath="/entries"
          currentClientId={clientId}
        />
      </div>

      <EntryTable entries={entries} />
    </div>
  );
}
