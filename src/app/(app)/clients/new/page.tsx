import { getClient } from "@/actions/clients";
import { ClientForm } from "@/components/client-form";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const client = id ? await getClient(id) : undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {client ? "Edit Client" : "New Client"}
      </h1>
      <ClientForm client={client ?? undefined} />
    </div>
  );
}
