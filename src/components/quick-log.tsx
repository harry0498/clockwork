"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEntry } from "@/actions/entries";

interface Client {
	id: string;
	name: string;
	defaultRate: string | null;
}

export function QuickLog({ clients }: { clients: Client[] }) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [rate, setRate] = useState("");

	function handleClientChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const client = clients.find((c) => c.id === e.target.value);
		if (client?.defaultRate) {
			setRate(client.defaultRate);
		}
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			await createEntry(formData);
			e.currentTarget.reset();
			setRate("");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	const today = new Date().toISOString().split("T")[0];

	if (clients.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Add a client first to start logging time.
			</p>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			{error && (
				<div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md">
					{error}
				</div>
			)}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<select
					name="clientId"
					required
					onChange={handleClientChange}
					className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				>
					<option value="">Client</option>
					{clients.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>
				<input
					name="title"
					type="text"
					required
					placeholder="What did you work on?"
					className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
				<input
					name="minutes"
					type="number"
					required
					min={1}
					placeholder="Minutes"
					className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
				<input
					name="ratePerHour"
					type="text"
					inputMode="decimal"
					required
					placeholder="£/hr"
					value={rate}
					onChange={(e) => setRate(e.target.value)}
					className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
			<input name="date" type="hidden" value={today} />
			<input name="notes" type="hidden" value="" />
			<button
				type="submit"
				disabled={loading}
				className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
			>
				{loading ? "Logging..." : "Quick Log"}
			</button>
		</form>
	);
}
