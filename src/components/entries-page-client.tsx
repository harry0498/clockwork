"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteEntry } from "@/actions/entries";
import { AlertDialog } from "@/components/alert-dialog";
import { EntryDialog } from "@/components/entry-dialog";
import type { EntryFormProps } from "@/components/entry-form";
import { EntryTable } from "@/components/entry-table";
import type { ClientPick, TimeEntryWithClient } from "@/lib/types";

type Entry = Pick<
  TimeEntryWithClient,
  | "id"
  | "title"
  | "notes"
  | "minutes"
  | "ratePerHour"
  | "date"
  | "clientId"
  | "invoiceId"
  | "manuallyInvoiced"
  | "client"
>;

export function EntriesPageClient({
  entries,
  clients,
  children,
  pagination,
}: {
  entries: Entry[];
  clients: ClientPick[];
  children?: React.ReactNode;
  pagination?: { currentPage: number; pageCount: number };
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<EntryFormProps["entry"] | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time Entries</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Entry
        </button>
      </div>

      {children}

      <EntryTable
        entries={entries}
        onNew={() => setCreateOpen(true)}
        onEdit={(entry) =>
          setEditEntry({
            id: entry.id,
            clientId: entry.clientId,
            title: entry.title,
            notes: entry.notes,
            minutes: entry.minutes,
            ratePerHour: entry.ratePerHour,
            date: entry.date,
          })
        }
        onDelete={setDeleteTarget}
        pagination={pagination}
      />

      <EntryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clients={clients}
      />

      <EntryDialog
        open={!!editEntry}
        onClose={() => setEditEntry(null)}
        clients={clients}
        entry={editEntry ?? undefined}
      />

      <AlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Entry"
        description="Delete this entry? This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteEntry(deleteTarget.id);
            router.refresh();
            toast.success("Entry deleted");
          }
        }}
      />
    </div>
  );
}
