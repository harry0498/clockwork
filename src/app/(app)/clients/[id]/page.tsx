import { notFound } from "next/navigation";
import { getClientWithStats } from "@/actions/clients";
import { ClientDetailActions } from "@/components/client-detail-actions";
import { StatGroup } from "@/components/stat-group";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientWithStats(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          {client.email && (
            <p className="text-muted-foreground">{client.email}</p>
          )}
        </div>
        <ClientDetailActions
          client={{
            id: client.id,
            name: client.name,
            email: client.email,
            addressLine1: client.addressLine1,
            addressLine2: client.addressLine2,
            county: client.county,
            postcode: client.postcode,
            vatNumber: client.vatNumber,
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatGroup
          variant="hours"
          total={client.totalMinutes}
          invoiced={client.billedMinutes}
          uninvoiced={client.unbilledMinutes}
          paid={client.paidMinutes}
        />
        <StatGroup
          variant="earnings"
          total={client.totalEarned}
          invoiced={client.billedAmount}
          uninvoiced={client.unbilledAmount}
          paid={client.paidAmount}
        />
      </div>

      {client.addressLine1 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-1 text-sm text-muted-foreground">Address</p>
          <div className="text-sm">
            <p>{client.addressLine1}</p>
            {client.addressLine2 && <p>{client.addressLine2}</p>}
            <p>{[client.county, client.postcode].filter(Boolean).join(", ")}</p>
          </div>
        </div>
      )}

      {client.vatNumber && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-1 text-sm text-muted-foreground">VAT Number</p>
          <p className="text-sm">{client.vatNumber}</p>
        </div>
      )}
    </div>
  );
}
