"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteClient } from "@/actions/clients";
import { AlertDialog } from "@/components/alert-dialog";
import { ClientDialog } from "@/components/client-dialog";
import type { ClientFormProps } from "@/components/client-form";

interface ClientDetailActionsProps {
  client: NonNullable<ClientFormProps["client"]>;
}

export function ClientDetailActions({ client }: ClientDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="rounded-lg border border-destructive px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Delete
        </button>
      </div>

      <ClientDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
      />

      <AlertDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Client"
        description={`Delete client "${client.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          await deleteClient(client.id);
          router.push("/clients");
          router.refresh();
          toast.success("Client deleted");
        }}
      />
    </>
  );
}
