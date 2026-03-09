"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteInvoice } from "@/actions/invoices";
import { AlertDialog } from "@/components/alert-dialog";
import { EmptyState } from "@/components/empty-state";
import { InvoiceDialog } from "@/components/invoice-dialog";
import { InvoiceTable } from "@/components/invoice-table";
import type { ClientPick, InvoiceWithClient, TimeEntry } from "@/lib/types";

type InvoiceEntry = Pick<
  TimeEntry,
  "id" | "title" | "minutes" | "ratePerHour" | "date"
>;

export function InvoicesPageClient({
  invoices,
  clients,
  getEntriesForClient,
  children,
  pagination,
}: {
  invoices: InvoiceWithClient[];
  clients: ClientPick[];
  getEntriesForClient: (clientId: string) => Promise<InvoiceEntry[]>;
  children?: React.ReactNode;
  pagination?: { currentPage: number; pageCount: number };
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceWithClient | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/invoices/template"
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Customise Template
          </Link>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            New Invoice
          </button>
        </div>
      </div>

      {children}

      {invoices.length === 0 ? (
        <EmptyState
          message="No invoices yet."
          actionLabel="Create Invoice"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <InvoiceTable
          invoices={invoices}
          onDelete={setDeleteTarget}
          pagination={pagination}
        />
      )}

      <InvoiceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clients={clients}
        getEntriesForClient={getEntriesForClient}
      />

      <AlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Invoice"
        description="Delete this invoice? Linked time entries will be unlinked."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteInvoice(deleteTarget.id);
            router.refresh();
            toast.success("Invoice deleted");
          }
        }}
      />
    </div>
  );
}
