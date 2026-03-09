import { getClientsWithStats } from "@/actions/clients";
import { ClientsPageClient } from "@/components/clients-page-client";

export default async function ClientsPage() {
  const clientList = await getClientsWithStats();

  return <ClientsPageClient clients={clientList} />;
}
