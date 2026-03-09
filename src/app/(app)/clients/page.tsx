import { getClientsWithStatsPaginated } from "@/actions/clients";
import { ClientsPageClient } from "@/components/clients-page-client";
import { parsePage } from "@/lib/pagination";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const { page, offset } = parsePage(params);

  const result = await getClientsWithStatsPaginated({ page, offset });

  return (
    <ClientsPageClient
      clients={result.data}
      pagination={{ currentPage: result.page, pageCount: result.pageCount }}
    />
  );
}
