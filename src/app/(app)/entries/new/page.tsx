import { getClients } from "@/actions/clients";
import { getEntry } from "@/actions/entries";
import { EntryForm } from "@/components/entry-form";

export default async function NewEntryPage({
	searchParams,
}: {
	searchParams: Promise<{ id?: string }>;
}) {
	const { id } = await searchParams;
	const [clients, entry] = await Promise.all([
		getClients(),
		id ? getEntry(id) : undefined,
	]);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">
				{entry ? "Edit Entry" : "New Entry"}
			</h1>
			{clients.length === 0 ? (
				<p className="text-muted-foreground">
					You need to create a client first before logging time.
				</p>
			) : (
				<EntryForm clients={clients} entry={entry ?? undefined} />
			)}
		</div>
	);
}
