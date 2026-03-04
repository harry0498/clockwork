"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createInvoice } from "@/actions/invoices";
import { formatGBP, formatMinutes } from "@/lib/tax-year";

interface Client {
	id: string;
	name: string;
}

interface Entry {
	id: string;
	title: string;
	minutes: number;
	ratePerHour: string;
	date: string;
}

export function InvoiceBuilder({
	clients,
	getEntriesForClient,
}: {
	clients: Client[];
	getEntriesForClient: (
		clientId: string,
	) => Promise<Entry[]>;
}) {
	const router = useRouter();
	const [clientId, setClientId] = useState("");
	const [entries, setEntries] = useState<Entry[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

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
		(sum, e) => sum + (e.minutes / 60) * Number.parseFloat(e.ratePerHour),
		0,
	);

	async function handleSubmit() {
		if (!clientId || selectedIds.size === 0) return;
		setError("");
		setLoading(true);

		try {
			const today = new Date().toISOString().split("T")[0];
			await createInvoice({
				clientId,
				entryIds: Array.from(selectedIds),
				issuedAt: today,
			});
			router.push("/invoices");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
			setLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			{error && (
				<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
					{error}
				</div>
			)}

			<div className="max-w-xs space-y-2">
				<label htmlFor="clientId" className="text-sm font-medium">
					Client
				</label>
				<select
					id="clientId"
					value={clientId}
					onChange={(e) => setClientId(e.target.value)}
					className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
					<div className="overflow-x-auto rounded-md border border-border">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border bg-muted/50">
									<th className="px-4 py-3 text-left">
										<input
											type="checkbox"
											checked={selectedIds.size === entries.length}
											onChange={toggleAll}
											className="rounded"
										/>
									</th>
									<th className="px-4 py-3 text-left font-medium">Date</th>
									<th className="px-4 py-3 text-left font-medium">Title</th>
									<th className="px-4 py-3 text-right font-medium">Time</th>
									<th className="px-4 py-3 text-right font-medium">Rate</th>
									<th className="px-4 py-3 text-right font-medium">Amount</th>
								</tr>
							</thead>
							<tbody>
								{entries.map((entry) => {
									const amount =
										(entry.minutes / 60) *
										Number.parseFloat(entry.ratePerHour);
									return (
										<tr
											key={entry.id}
											className="border-b border-border last:border-0"
										>
											<td className="px-4 py-3">
												<input
													type="checkbox"
													checked={selectedIds.has(entry.id)}
													onChange={() => toggleEntry(entry.id)}
													className="rounded"
												/>
											</td>
											<td className="px-4 py-3">{entry.date}</td>
											<td className="px-4 py-3">{entry.title}</td>
											<td className="px-4 py-3 text-right">
												{formatMinutes(entry.minutes)}
											</td>
											<td className="px-4 py-3 text-right">
												{formatGBP(entry.ratePerHour)}/hr
											</td>
											<td className="px-4 py-3 text-right font-medium">
												{formatGBP(amount)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
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
							className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
						>
							{loading ? "Creating..." : "Create Invoice"}
						</button>
					</div>
				</>
			)}

			{clientId && entries.length === 0 && (
				<p className="text-muted-foreground">
					No uninvoiced entries for this client.
				</p>
			)}
		</div>
	);
}
