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
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">
            You need to create a client first before logging time.
          </p>
          <a
            href="/clients/new"
            className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add Client
          </a>
        </div>
      ) : (
        <EntryForm clients={clients} entry={entry ?? undefined} />
      )}
    </div>
  );
}
