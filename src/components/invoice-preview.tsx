import type {
  FooterProfileData,
  InvoiceTemplateConfig,
} from "@/lib/invoice-template";
import { resolveFooterPlaceholders } from "@/lib/invoice-template";

interface InvoicePreviewProps {
  config: InvoiceTemplateConfig;
  profile: FooterProfileData;
}

const sampleEntries = [
  { title: "Website redesign - homepage", minutes: 130, rate: 45 },
  { title: "Website redesign - about page", minutes: 170, rate: 45 },
  { title: "API integration work", minutes: 245, rate: 45 },
  { title: "Bug fixes and QA testing", minutes: 95, rate: 45 },
];

function formatGBP(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

function formatHours(minutes: number, format: "decimal" | "hm"): string {
  if (format === "hm") {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  return (minutes / 60).toFixed(2);
}

const titleSizeMap = {
  small: "text-base",
  medium: "text-lg",
  large: "text-xl sm:text-2xl",
} as const;

const bodySizeMap = {
  small: "text-[7px]",
  medium: "text-[8px] sm:text-[9px]",
  large: "text-[9px] sm:text-[10px]",
} as const;

const alignMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function InvoicePreview({ config, profile }: InvoicePreviewProps) {
  const c = config;
  const title = c.titleText || "INVOICE";
  const totalMinutes = sampleEntries.reduce((sum, e) => sum + e.minutes, 0);
  const totalAmount = sampleEntries.reduce(
    (sum, e) => sum + (e.minutes / 60) * e.rate,
    0,
  );

  const clientOnLeft = c.clientDetailsPosition === "left";

  const invoiceMetaBlock = (
    <div className={clientOnLeft ? "text-right" : ""}>
      <h1
        className={`font-bold ${titleSizeMap[c.titleSize]} ${alignMap[c.titleAlignment]}`}
        style={{ color: c.titleColor }}
      >
        {title}
      </h1>
      <p>Date: 9 Mar 2026</p>
      <p>Invoice #: 260309A</p>
    </div>
  );

  const clientBlock = (
    <div className={clientOnLeft ? "" : "text-right"}>
      <p className="font-bold">Acme Corp Ltd</p>
      <p>123 Business Street</p>
      <p>London</p>
      <p>SW1A 1AA</p>
      <p>VAT: GB123456789</p>
    </div>
  );

  const invoiceForBlock = c.showInvoiceFor ? (
    <div className="text-center">
      <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400">
        Invoice For
      </p>
      <p className="font-bold">Acme Corp Ltd</p>
    </div>
  ) : null;

  profile.reference = "260309A";

  const resolvedFooter = c.footer
    ? resolveFooterPlaceholders(c.footer, profile)
    : "";

  return (
    <div
      className={`flex aspect-[1/1.414] w-full flex-col bg-white p-6 leading-tight shadow-lg sm:p-8 ${bodySizeMap[c.bodySize]}`}
      style={{ color: c.textColor }}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-2">
        {clientOnLeft ? (
          <>
            <div className="flex-1">{clientBlock}</div>
            {invoiceForBlock && <div className="flex-1">{invoiceForBlock}</div>}
            <div className="flex-1">{invoiceMetaBlock}</div>
          </>
        ) : (
          <>
            <div className="flex-1">{invoiceMetaBlock}</div>
            {invoiceForBlock && <div className="flex-1">{invoiceForBlock}</div>}
            <div className="flex-1">{clientBlock}</div>
          </>
        )}
      </div>

      {/* Table */}
      <div>
        <div
          className="flex pb-1 font-bold"
          style={{
            borderBottomWidth: 2,
            borderBottomColor: c.tableBorderColor,
            backgroundColor: c.tableHeaderBgColor,
            color: c.tableHeaderTextColor,
          }}
        >
          <span className="flex-[3]">Description</span>
          {c.showHoursColumn && <span className="w-12 text-right">Hours</span>}
          {c.showRateColumn && (
            <span className="w-14 text-right">Rate (£)</span>
          )}
          <span className="w-14 text-right">Total (£)</span>
        </div>

        {sampleEntries.map((entry) => {
          const amount = (entry.minutes / 60) * entry.rate;
          return (
            <div
              key={entry.title}
              className="flex border-b border-gray-100 py-1"
            >
              <span className="flex-[3]">{entry.title}</span>
              {c.showHoursColumn && (
                <span className="w-12 text-right">
                  {formatHours(entry.minutes, c.hoursFormat)}
                </span>
              )}
              {c.showRateColumn && (
                <span className="w-14 text-right">{formatGBP(entry.rate)}</span>
              )}
              <span className="w-14 text-right">{formatGBP(amount)}</span>
            </div>
          );
        })}

        <div
          className="mt-1 flex pt-1 text-[10px] font-bold"
          style={{
            borderTopWidth: 2,
            borderTopColor: c.tableBorderColor,
          }}
        >
          <span className="flex-[3]">Grand Total</span>
          {c.showHoursColumn && (
            <span className="w-12 text-right">
              {formatHours(totalMinutes, c.hoursFormat)}
            </span>
          )}
          {c.showRateColumn && <span className="w-14" />}
          <span className="w-14 text-right">{formatGBP(totalAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      {resolvedFooter && (
        <div
          className="mt-6 border-t border-gray-200 pt-2 text-center text-[7px]"
          style={{ color: c.footerTextColor }}
        >
          <p className="whitespace-pre-line">{resolvedFooter}</p>
        </div>
      )}
    </div>
  );
}
