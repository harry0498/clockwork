import { ClientForm } from "@/components/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Client</h1>
      <ClientForm />
    </div>
  );
}
