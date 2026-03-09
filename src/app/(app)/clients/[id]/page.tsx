import { notFound } from "next/navigation";
import { getClientWithStats } from "@/actions/clients";
import { ClientDetailActions } from "@/components/client-detail-actions";
import { formatGBP, formatMinutes } from "@/lib/tax-year";

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
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Hours</p>
          <p className="text-2xl font-bold">
            {formatMinutes(client.totalMinutes)}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2 text-sm">
            <p className="text-green-600">
              Invoiced: {formatMinutes(client.billedMinutes)}
            </p>
            <p className="text-amber-600">
              Uninvoiced: {formatMinutes(client.unbilledMinutes)}
            </p>
            <p className="text-emerald-600">
              Paid: {formatMinutes(client.paidMinutes)}
            </p>
            <p className="text-red-600">
              Unpaid: {formatMinutes(client.unpaidMinutes)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Earnings</p>
          <p className="text-2xl font-bold">{formatGBP(client.totalEarned)}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2 text-sm">
            <p className="text-green-600">
              Invoiced: {formatGBP(client.billedAmount)}
            </p>
            <p className="text-amber-600">
              Uninvoiced: {formatGBP(client.unbilledAmount)}
            </p>
            <p className="text-emerald-600">
              Paid: {formatGBP(client.paidAmount)}
            </p>
            <p className="text-red-600">
              Unpaid: {formatGBP(client.unpaidAmount)}
            </p>
          </div>
        </div>
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
