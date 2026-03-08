import Link from "next/link";
import { getClientsWithStats } from "@/actions/clients";
import { ClientDeleteButton } from "@/components/client-delete-button";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { formatGBP, formatMinutes } from "@/lib/tax-year";

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
        <DataTable
          columns={[
            { header: "Name", accessor: "name", className: "font-medium" },
            {
              header: "Email",
              accessor: (c) => (
                <span className="text-muted-foreground">
                  {c.email || "\u2014"}
                </span>
              ),
            },
            {
              header: "Total Hours",
              accessor: (c) => formatMinutes(c.totalMinutes),
              align: "right",
            },
            {
              header: "Total Earned",
              accessor: (c) => formatGBP(c.totalEarned),
              align: "right",
            },
            {
              header: "Unbilled",
              accessor: (c) => formatGBP(c.unbilledAmount),
              align: "right",
            },
            {
              header: "Actions",
              align: "right",
              accessor: (c) => (
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/clients/new?id=${c.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </Link>
                  <ClientDeleteButton clientId={c.id} clientName={c.name} />
                </div>
              ),
            },
          ]}
          data={clientList}
          keyExtractor={(c) => c.id}
        />
      )}
    </div>
  );
}
