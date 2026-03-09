"use client";

import { useEffect, useState } from "react";

export function InvoicePdfInline({ invoiceId }: { invoiceId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;

    fetch(`/api/invoices/${invoiceId}/pdf`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load PDF");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        revoke = blobUrl;
        setUrl(blobUrl);
      })
      .catch(() => setError(true));

    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [invoiceId]);

  if (error) {
    return (
      <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Failed to load preview
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-lg border border-border bg-muted/30">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <iframe
      src={`${url}#toolbar=0&navpanes=0&view=FitH`}
      className="aspect-[1/1.414] w-full rounded-lg border border-border bg-white"
      title="Invoice preview"
    />
  );
}
