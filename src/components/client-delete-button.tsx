"use client";

import { useRouter } from "next/navigation";
import { deleteClient } from "@/actions/clients";

export function ClientDeleteButton({
	clientId,
	clientName,
}: {
	clientId: string;
	clientName: string;
}) {
	const router = useRouter();

	async function handleDelete() {
		if (!confirm(`Delete client "${clientName}"? This cannot be undone.`)) {
			return;
		}
		await deleteClient(clientId);
		router.refresh();
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			className="text-sm text-destructive hover:text-destructive/80"
		>
			Delete
		</button>
	);
}
