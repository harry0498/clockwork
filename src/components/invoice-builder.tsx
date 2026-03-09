"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createInvoice } from "@/actions/invoices";
import { type Column, DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { inputClassName } from "@/lib/constants";
import {
  calculateAmount,
  formatGBP,
  formatMinutes,
  todayISO,
} from "@/lib/tax-year";
import type { ClientPick, TimeEntry } from "@/lib/types";

type InvoiceEntry = Pick<
  TimeEntry,
  "id" | "title" | "minutes" | "ratePerHour" | "date"
>;

export function InvoiceBuilder({
  clients,
  getEntriesForClient,
  onSuccess,
}: {
  clients: ClientPick[];
  getEntriesForClient: (clientId: string) => Promise<InvoiceEntry[]>;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [entries, setEntries] = useState<InvoiceEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setEntries([]);
      setSelectedIds(new Set());
      return;
    }
    getEntriesForClient(clientId).then((e) => {
      setEntries(e);
      setSelectedIds(new Set(e.map((x) => x.id)));
    });
  }, [clientId, getEntriesForClient]);

  function toggleEntry(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    }
  }

  const selectedEntries = entries.filter((e) => selectedIds.has(e.id));
  const total = selectedEntries.reduce(
    (sum, e) => sum + calculateAmount(e.minutes, e.ratePerHour),
    0,
  );

  async function handleSubmit() {
    if (!clientId || selectedIds.size === 0) return;
    setLoading(true);

    try {
      await createInvoice({
        clientId,
        entryIds: Array.from(selectedIds),
        issuedAt: todayISO(),
      });
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/invoices");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="w-full max-w-xs space-y-2">
        <label htmlFor="clientId" className="text-sm font-medium">
          Client
        </label>
        <select
          id="clientId"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className={inputClassName}
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {entries.length > 0 && (
        <>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-border">
            <DataTable
              columns={invoiceColumns(selectedIds, toggleAll, toggleEntry)}
              data={entries}
              keyExtractor={(e) => e.id}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} entries selected
              </p>
              <p className="text-xl font-bold">{formatGBP(total)}</p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || selectedIds.size === 0}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </>
      )}

      {clientId && entries.length === 0 && (
        <EmptyState
          message="All caught up -- no unbilled time for this client."
          actionLabel="Log Time"
          actionHref="/entries/new"
        />
      )}
    </div>
  );
}

function invoiceColumns(
  selectedIds: Set<string>,
  toggleAll: () => void,
  toggleEntry: (id: string) => void,
): Column<InvoiceEntry>[] {
  return [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={selectedIds.size > 0}
          onChange={toggleAll}
          className="rounded"
        />
      ),
      accessor: (entry) => (
        <input
          type="checkbox"
          checked={selectedIds.has(entry.id)}
          onChange={() => toggleEntry(entry.id)}
          className="rounded"
        />
      ),
    },
    { header: "Date", accessor: "date" },
    { header: "Title", accessor: "title" },
    {
      header: "Time",
      accessor: (e) => formatMinutes(e.minutes),
      align: "right",
    },
    {
      header: "Rate",
      accessor: (e) => `${formatGBP(e.ratePerHour)}/hr`,
      align: "right",
    },
    {
      header: "Amount",
      accessor: (e) => formatGBP(calculateAmount(e.minutes, e.ratePerHour)),
      align: "right",
      className: "font-medium",
    },
  ];
}
