"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteClient } from "@/actions/clients";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete client "${clientName}"? This cannot be undone.`)) {
      return;
    }
    setPending(true);
    try {
      await deleteClient(clientId);
      router.push("/clients");
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
