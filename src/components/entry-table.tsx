"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  bulkDeleteEntries,
  bulkMarkInvoiced,
  bulkUnmarkInvoiced,
  toggleManuallyInvoiced,
} from "@/actions/entries";
import { ActionMenu } from "@/components/action-menu";
import { AlertDialog } from "@/components/alert-dialog";
import { type Column, DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { calculateAmount, formatGBP, formatMinutes } from "@/lib/tax-year";
import type { TimeEntryWithClient } from "@/lib/types";

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

export function EntryTable({
  entries,
  onEdit,
  onDelete,
  onNew,
  pagination,
}: {
  entries: Entry[];
  onEdit?: (entry: Entry) => void;
  onDelete?: (entry: Entry) => void;
  onNew?: () => void;
  pagination?: { currentPage: number; pageCount: number };
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Clear selection when entries change (e.g. page navigation)
  const entriesKey = entries.map((e) => e.id).join(",");
  const prevEntriesKey = useRef(entriesKey);
  if (prevEntriesKey.current !== entriesKey) {
    prevEntriesKey.current = entriesKey;
    if (selectedIds.size > 0) setSelectedIds(new Set());
  }

  const selectableIds = useMemo(
    () => entries.filter((e) => !e.invoiceId).map((e) => e.id),
    [entries],
  );

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectableIds.some((id) => selectedIds.has(id));

  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  }

  async function handleBulkMark() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    await bulkMarkInvoiced(ids);
    setSelectedIds(new Set());
    router.refresh();
    toast.success(`${ids.length} entries marked as invoiced`);
  }

  async function handleBulkUnmark() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    await bulkUnmarkInvoiced(ids);
    setSelectedIds(new Set());
    router.refresh();
    toast.success(`${ids.length} entries unmarked`);
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    await bulkDeleteEntries(ids);
    setSelectedIds(new Set());
    router.refresh();
    toast.success(`${ids.length} entries deleted`);
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        message="No entries for this period."
        actionLabel="Log Time"
        onAction={onNew}
        actionHref={onNew ? undefined : "/entries/new"}
      />
    );
  }

  const columns: Column<Entry>[] = [
    { header: "Date", accessor: "date" },
    {
      header: "Client",
      accessor: (e) => (
        <Link href={`/clients/${e.client.id}`} className="hover:underline">
          {e.client.name}
        </Link>
      ),
    },
    { header: "Title", accessor: "title", className: "font-medium" },
    {
      header: "Time",
      accessor: (e) => formatMinutes(e.minutes),
      align: "right",
    },
    {
      header: "Rate",
      accessor: (e) => `${formatGBP(e.ratePerHour)}/hr`,
      align: "right",
      hideOnMobile: true,
    },
    {
      header: "Amount",
      accessor: (e) => formatGBP(calculateAmount(e.minutes, e.ratePerHour)),
      align: "right",
      className: "font-medium",
      hideOnMobile: true,
    },
    {
      header: "Invoiced",
      align: "center",
      hideOnMobile: true,
      accessor: (e) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
            e.invoiceId || e.manuallyInvoiced
              ? "bg-green-100 text-green-800"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {e.invoiceId || e.manuallyInvoiced ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {someSelected && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-accent px-4 py-3 shadow-sm">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBulkMark}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              Mark Invoiced
            </button>
            <button
              type="button"
              onClick={handleBulkUnmark}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              Unmark Invoiced
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="rounded-lg bg-destructive px-3 py-1.5 text-sm text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={entries}
        keyExtractor={(e) => e.id}
        pagination={pagination}
        selection={{
          selectedKeys: selectedIds,
          onToggle: handleToggle,
          onToggleAll: handleToggleAll,
          allSelected,
          someSelected,
          isSelectable: (id) => !entries.find((e) => e.id === id)?.invoiceId,
        }}
        actions={(entry) =>
          entry.invoiceId ? (
            <ActionMenu
              items={[
                {
                  label: "View Invoice",
                  href: `/invoices/${entry.invoiceId}`,
                },
              ]}
            />
          ) : (
            <ActionMenu
              items={[
                {
                  label: "Edit",
                  onClick: onEdit ? () => onEdit(entry) : undefined,
                  href: onEdit ? undefined : `/entries/new?id=${entry.id}`,
                  hidden: entry.manuallyInvoiced,
                },
                {
                  label: entry.manuallyInvoiced
                    ? "Unmark as invoiced"
                    : "Mark as Invoiced",
                  onClick: () => toggleManuallyInvoiced(entry.id),
                },
                {
                  label: "Delete",
                  onClick: onDelete ? () => onDelete(entry) : undefined,
                  variant: "destructive",
                  hidden: entry.manuallyInvoiced,
                },
              ]}
            />
          )
        }
      />

      <AlertDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete Entries"
        description={`Delete ${selectedIds.size} selected entries? Only uninvoiced, non-manually-invoiced entries will be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
