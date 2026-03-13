"use client";

import { useRouter } from "next/navigation";
import { updateInvoiceStatus } from "@/actions/invoices";
import { buttonClassName } from "@/lib/constants";

const nextStatus: Record<string, "sent" | "paid"> = {
  draft: "sent",
  sent: "paid",
};

const statusLabels: Record<string, string> = {
  draft: "Mark as Sent",
  sent: "Mark as Paid",
};

export function InvoiceStatusToggle({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  if (currentStatus === "paid") {
    return (
      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
        Paid
      </span>
    );
  }

  async function handleClick() {
    const next = nextStatus[currentStatus];
    if (!next) return;
    await updateInvoiceStatus(invoiceId, next);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleClick} className={buttonClassName}>
      {statusLabels[currentStatus]}
    </button>
  );
}
