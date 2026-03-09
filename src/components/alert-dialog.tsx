"use client";

import { useState } from "react";
import { Dialog } from "@/components/dialog";

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "destructive";
}

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant,
}: AlertDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
            variant === "destructive"
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {loading ? "..." : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
