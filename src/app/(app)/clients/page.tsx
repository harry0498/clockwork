import { getClientsWithStatsPaginated } from "@/actions/clients";
import { ClientsPageClient } from "@/components/clients-page-client";
import { SearchFilter } from "@/components/search-filter";
import { parsePage, parseSort } from "@/lib/pagination";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const params = await searchParams;
  const { page, offset } = parsePage(params);
  const { sort, dir } = parseSort(
    params,
    ["name", "totalEarned", "unbilled"] as const,
    "name",
    "asc",
  );

  const result = await getClientsWithStatsPaginated({
    page,
    offset,
    search: params.search,
    sortBy: sort,
    sortDir: dir,
  });

  return (
    <ClientsPageClient
      clients={result.data}
      pagination={{ currentPage: result.page, pageCount: result.pageCount }}
      sorting={{ sort, dir }}
    >
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm">
        <SearchFilter placeholder="Search clients..." />
      </div>
    </ClientsPageClient>
  );
}
