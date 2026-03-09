import { getInvoiceTemplate } from "@/actions/invoice-template";
import { InvoiceTemplateEditor } from "@/components/invoice-template-editor";

export default async function InvoiceTemplatePage() {
  const { config, profile } = await getInvoiceTemplate();

  return (
    <div className="flex h-full flex-col gap-6 lg:overflow-hidden">
      <h1 className="shrink-0 text-2xl font-bold">
        Customise Invoice Template
      </h1>
      <InvoiceTemplateEditor config={config} profile={profile} />
    </div>
  );
}
