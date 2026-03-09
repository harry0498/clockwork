"use client";

import { Dialog } from "@/components/dialog";
import { InvoiceBuilder } from "@/components/invoice-builder";
import type { ClientPick, TimeEntry } from "@/lib/types";

type InvoiceEntry = Pick<
  TimeEntry,
  "id" | "title" | "minutes" | "ratePerHour" | "date"
>;

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  clients: ClientPick[];
  getEntriesForClient: (clientId: string) => Promise<InvoiceEntry[]>;
}

export function InvoiceDialog({
  open,
  onClose,
  clients,
  getEntriesForClient,
}: InvoiceDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="New Invoice" size="lg">
      <InvoiceBuilder
        clients={clients}
        getEntriesForClient={getEntriesForClient}
        onSuccess={onClose}
      />
    </Dialog>
  );
}
