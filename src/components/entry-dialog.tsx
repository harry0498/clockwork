"use client";

import { Dialog } from "@/components/dialog";
import { EntryForm, type EntryFormProps } from "@/components/entry-form";

interface EntryDialogProps {
  open: boolean;
  onClose: () => void;
  clients: EntryFormProps["clients"];
  entry?: EntryFormProps["entry"];
}

export function EntryDialog({
  open,
  onClose,
  clients,
  entry,
}: EntryDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={entry ? "Edit Entry" : "New Entry"}
      size="md"
    >
      <EntryForm
        clients={clients}
        entry={entry}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Dialog>
  );
}
