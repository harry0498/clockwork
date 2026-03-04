"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient, updateClient } from "@/actions/clients";

interface ClientFormProps {
	client?: {
		id: string;
		name: string;
		email: string | null;
		address: string | null;
		defaultRate: string | null;
	};
}

export function ClientForm({ client }: ClientFormProps) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const isEditing = !!client;

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			if (isEditing) {
				await updateClient(client.id, formData);
			} else {
				await createClient(formData);
			}
			router.push("/clients");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="max-w-md space-y-4">
			{error && (
				<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
					{error}
				</div>
			)}

			<div className="space-y-2">
				<label htmlFor="name" className="text-sm font-medium">
					Name *
				</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					maxLength={200}
					defaultValue={client?.name ?? ""}
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="email" className="text-sm font-medium">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					defaultValue={client?.email ?? ""}
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="address" className="text-sm font-medium">
					Address
				</label>
				<textarea
					id="address"
					name="address"
					rows={3}
					defaultValue={client?.address ?? ""}
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="defaultRate" className="text-sm font-medium">
					Default Hourly Rate (£)
				</label>
				<input
					id="defaultRate"
					name="defaultRate"
					type="text"
					inputMode="decimal"
					placeholder="0.00"
					defaultValue={client?.defaultRate ?? ""}
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div className="flex gap-2">
				<button
					type="submit"
					disabled={loading}
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
				>
					{loading
						? "Saving..."
						: isEditing
							? "Update Client"
							: "Create Client"}
				</button>
				<button
					type="button"
					onClick={() => router.back()}
					className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}
