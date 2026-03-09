"use client";

import { ClientForm, type ClientFormProps } from "@/components/client-form";
import { Dialog } from "@/components/dialog";

interface ClientDialogProps {
  open: boolean;
  onClose: () => void;
  client?: ClientFormProps["client"];
}

export function ClientDialog({ open, onClose, client }: ClientDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={client ? "Edit Client" : "New Client"}
      size="md"
    >
      <ClientForm client={client} onSuccess={onClose} onCancel={onClose} />
    </Dialog>
  );
}
