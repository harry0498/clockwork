import Link from "next/link";
import { getClientsWithStats } from "@/actions/clients";
import { ClientTable } from "@/components/client-table";
import { EmptyState } from "@/components/empty-state";

export default async function ClientsPage() {
  const clientList = await getClientsWithStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link
          href="/clients/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Client
        </Link>
      </div>

      {clientList.length === 0 ? (
        <EmptyState
          message="No clients yet. Add your first client to get started."
          actionLabel="Add Client"
          actionHref="/clients/new"
        />
      ) : (
        <ClientTable clients={clientList} />
      )}
    </div>
  );
}
