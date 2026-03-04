import { getClients } from "@/actions/clients";
import { getEntries } from "@/actions/entries";
import { InvoiceBuilder } from "@/components/invoice-builder";

export default async function NewInvoicePage() {
	const clients = await getClients();

	async function getEntriesForClient(clientId: string) {
		"use server";
		const entries = await getEntries({
			clientId,
			uninvoicedOnly: true,
			sortBy: "date",
			sortDir: "asc",
		});
		return entries.map((e) => ({
			id: e.id,
			title: e.title,
			minutes: e.minutes,
			ratePerHour: e.ratePerHour,
			date: e.date,
		}));
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">New Invoice</h1>
			{clients.length === 0 ? (
				<p className="text-muted-foreground">
					Add a client and log some time first.
				</p>
			) : (
				<InvoiceBuilder
					clients={clients}
					getEntriesForClient={getEntriesForClient}
				/>
			)}
		</div>
	);
}
