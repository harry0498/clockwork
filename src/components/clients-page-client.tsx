"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteClient, getClient } from "@/actions/clients";
import { AlertDialog } from "@/components/alert-dialog";
import { ClientDialog } from "@/components/client-dialog";
import type { ClientFormProps } from "@/components/client-form";
import { ClientTable } from "@/components/client-table";
import { EmptyState } from "@/components/empty-state";

interface ClientWithStats {
  id: string;
  name: string;
  email: string | null;
  totalMinutes: number;
  totalEarned: number;
  unbilledAmount: number;
}

export function ClientsPageClient({
  clients,
  pagination,
}: {
  clients: ClientWithStats[];
  pagination?: { currentPage: number; pageCount: number };
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<
    ClientFormProps["client"] | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientWithStats | null>(
    null,
  );

  async function handleEdit(c: ClientWithStats) {
    const full = await getClient(c.id);
    if (full) {
      setEditClient({
        id: full.id,
        name: full.name,
        email: full.email,
        addressLine1: full.addressLine1,
        addressLine2: full.addressLine2,
        county: full.county,
        postcode: full.postcode,
        vatNumber: full.vatNumber,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          message="No clients yet. Add your first client to get started."
          actionLabel="Add Client"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <ClientTable
          clients={clients}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          pagination={pagination}
        />
      )}

      <ClientDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <ClientDialog
        open={!!editClient}
        onClose={() => setEditClient(null)}
        client={editClient ?? undefined}
      />

      <AlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Client"
        description={`Delete client "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteClient(deleteTarget.id);
            router.refresh();
            toast.success("Client deleted");
          }
        }}
      />
    </div>
  );
}
