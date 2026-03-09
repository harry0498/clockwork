"use client";

import { usePDF } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import { InvoicePdfPreviewDoc } from "@/lib/invoice-pdf";
import type {
  FooterProfileData,
  InvoiceTemplateConfig,
} from "@/lib/invoice-template";

interface InvoicePdfPreviewProps {
  config: InvoiceTemplateConfig;
  profile: FooterProfileData;
}

function PdfPreviewInner({ config, profile }: InvoicePdfPreviewProps) {
  const [debouncedConfig, setDebouncedConfig] =
    useState<InvoiceTemplateConfig>(config);
  const [debouncedProfile, setDebouncedProfile] =
    useState<FooterProfileData>(profile);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedConfig(config);
      setDebouncedProfile(profile);
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [config, profile]);

  const [instance, updateInstance] = usePDF({
    document: (
      <InvoicePdfPreviewDoc
        config={debouncedConfig}
        profile={debouncedProfile}
      />
    ),
  });

  useEffect(() => {
    updateInstance(
      <InvoicePdfPreviewDoc
        config={debouncedConfig}
        profile={debouncedProfile}
      />,
    );
  }, [debouncedConfig, debouncedProfile, updateInstance]);

  if (instance.loading) {
    return (
      <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-md border bg-white lg:aspect-auto lg:h-full">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (instance.error) {
    return (
      <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-md border bg-white text-sm text-destructive lg:aspect-auto lg:h-full">
        Failed to render preview
      </div>
    );
  }

  return (
    <iframe
      src={`${instance.url}#toolbar=0&navpanes=0&view=Fit`}
      className="aspect-[1/1.414] w-full rounded-md border bg-white shadow-lg lg:aspect-auto lg:h-full"
      title="Invoice preview"
    />
  );
}

export default PdfPreviewInner;
