import { getInvoiceTemplate } from "@/actions/invoice-template";
import { InvoiceTemplateEditor } from "@/components/invoice-template-editor";

export default async function InvoiceTemplatePage() {
  const { config, profile } = await getInvoiceTemplate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customise Invoice Template</h1>
      <InvoiceTemplateEditor config={config} profile={profile} />
    </div>
  );
}
