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
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">
            You need a client and some logged time before creating an invoice.
          </p>
          <a
            href="/clients/new"
            className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add Client
          </a>
        </div>
      ) : (
        <InvoiceBuilder
          clients={clients}
          getEntriesForClient={getEntriesForClient}
        />
      )}
    </div>
  );
}
