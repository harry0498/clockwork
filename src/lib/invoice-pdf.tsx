import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  FooterProfileData,
  InvoiceTemplateConfig,
} from "@/lib/invoice-template";
import {
  parseFooterBold,
  parseTemplate,
  resolveFooterPlaceholders,
} from "@/lib/invoice-template";
import type { Client, Invoice, TimeEntry, User } from "@/lib/types";

const sampleEntries: TimeEntry[] = [
  {
    id: "preview-1",
    userId: "preview",
    clientId: "preview",
    title: "Website redesign - homepage",
    notes: null,
    minutes: 130,
    ratePerHour: "45.00",
    date: "2026-03-01",
    invoiceId: null,
    manuallyInvoiced: false,
    createdAt: new Date(),
  },
  {
    id: "preview-2",
    userId: "preview",
    clientId: "preview",
    title: "Website redesign - about page",
    notes: null,
    minutes: 170,
    ratePerHour: "45.00",
    date: "2026-03-02",
    invoiceId: null,
    manuallyInvoiced: false,
    createdAt: new Date(),
  },
  {
    id: "preview-3",
    userId: "preview",
    clientId: "preview",
    title: "API integration work",
    notes: null,
    minutes: 245,
    ratePerHour: "45.00",
    date: "2026-03-03",
    invoiceId: null,
    manuallyInvoiced: false,
    createdAt: new Date(),
  },
  {
    id: "preview-4",
    userId: "preview",
    clientId: "preview",
    title: "Bug fixes and QA testing",
    notes: null,
    minutes: 95,
    ratePerHour: "45.00",
    date: "2026-03-04",
    invoiceId: null,
    manuallyInvoiced: false,
    createdAt: new Date(),
  },
];

function formatGBP(amount: number | string): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return `£${num.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

const titleSizePt = { small: 16, medium: 20, large: 24 } as const;
const bodySizePt = { small: 8, medium: 9, large: 10 } as const;
const footerSizePt = { small: 7, medium: 8, large: 9 } as const;

interface InvoicePdfProps {
  invoice: Invoice;
  client: Client;
  entries: TimeEntry[];
  user: User;
}

export function InvoicePdf({
  invoice,
  client,
  entries,
  user,
}: InvoicePdfProps) {
  const c: InvoiceTemplateConfig = parseTemplate(user.invoiceTemplate);

  const title = c.titleText || "INVOICE";
  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  const totalAmount = Number.parseFloat(invoice.totalAmount);
  const bodySize = bodySizePt[c.bodySize];
  const footerSize = footerSizePt[c.footerSize];

  const clientAddress = [
    client.addressLine1,
    client.addressLine2,
    client.county,
    client.postcode,
  ].filter(Boolean);

  const clientOnLeft = c.clientDetailsPosition === "left";

  // Column widths
  const hoursWidth = c.showHoursColumn ? 55 : 0;
  const rateWidth = c.showRateColumn ? 65 : 0;
  const totalWidth = 65;

  const resolvedFooter = c.footer
    ? resolveFooterPlaceholders(c.footer, {
        name: user.name,
        email: user.email,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        county: user.county,
        postcode: user.postcode,
        mobile: user.mobile,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        sortCode: user.sortCode,
        reference: invoice.invoiceNumber,
      })
    : "";

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: bodySize,
      fontFamily: "Helvetica",
      color: c.textColor,
    },
    headerRow: {
      flexDirection: "row",
      marginBottom: 28,
    },
    title: {
      fontSize: titleSizePt[c.titleSize],
      fontFamily: "Helvetica-Bold",
      color: c.titleColor,
      marginBottom: 4,
      textAlign: c.titleAlignment,
    },
    invoiceForLabel: {
      fontSize: bodySize,
      fontFamily: "Helvetica-Bold",
      color: "#999",
      textTransform: "uppercase" as const,
      marginBottom: 3,
    },
    invoiceForName: {
      fontSize: bodySize + 2,
      fontFamily: "Helvetica-Bold",
    },
    meta: {
      fontSize: bodySize,
      marginBottom: 2,
    },
    clientName: {
      fontSize: bodySize + 1,
      fontFamily: "Helvetica-Bold",
      marginBottom: 2,
    },
    clientDetail: {
      fontSize: bodySize,
      marginBottom: 1,
    },
    tableHeaderRow: {
      flexDirection: "row",
      borderBottomWidth: 2,
      borderBottomColor: c.tableBorderColor,
      backgroundColor: c.tableHeaderBgColor,
      paddingBottom: 4,
      paddingHorizontal: 2,
      marginBottom: 2,
    },
    tableHeaderText: {
      fontFamily: "Helvetica-Bold",
      color: c.tableHeaderTextColor,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      paddingVertical: 4,
      paddingHorizontal: 2,
    },
    colDesc: {
      flex: 1,
    },
    colHours: {
      width: hoursWidth,
      textAlign: "right",
    },
    colRate: {
      width: rateWidth,
      textAlign: "right",
    },
    colTotal: {
      width: totalWidth,
      textAlign: "right",
    },
    totalRow: {
      flexDirection: "row",
      borderTopWidth: 2,
      borderTopColor: c.tableBorderColor,
      paddingTop: 6,
      paddingHorizontal: 2,
      marginTop: 4,
    },
    totalLabel: {
      flex: 1,
      fontFamily: "Helvetica-Bold",
      fontSize: bodySize + 2,
    },
    totalHours: {
      width: hoursWidth,
      textAlign: "right",
      fontFamily: "Helvetica-Bold",
      fontSize: bodySize + 2,
    },
    totalRate: {
      width: rateWidth,
    },
    totalValue: {
      width: totalWidth,
      textAlign: "right",
      fontFamily: "Helvetica-Bold",
      fontSize: bodySize + 2,
    },
    footer: {
      position: "absolute" as const,
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: "center",
      fontSize: footerSize,
      color: c.footerTextColor,
      borderTopWidth: 1,
      borderTopColor: "#eee",
      paddingTop: 6,
    },
  });

  const invoiceMetaView = (
    <View
      style={{
        flex: 1,
        alignItems: clientOnLeft ? "flex-end" : "flex-start",
      }}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>Date: {formatDate(invoice.issuedAt)}</Text>
      <Text style={styles.meta}>Invoice #: {invoice.invoiceNumber}</Text>
    </View>
  );

  const clientView = (
    <View
      style={{
        flex: 1,
        alignItems: clientOnLeft ? "flex-start" : "flex-end",
      }}
    >
      <Text style={styles.clientName}>{client.name}</Text>
      {clientAddress.map((line) => (
        <Text key={line} style={styles.clientDetail}>
          {line}
        </Text>
      ))}
      {client.vatNumber && (
        <Text style={styles.clientDetail}>VAT: {client.vatNumber}</Text>
      )}
    </View>
  );

  const invoiceForView = c.showInvoiceFor ? (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.invoiceForLabel}>Invoice For</Text>
      <Text style={styles.invoiceForName}>{client.name}</Text>
    </View>
  ) : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          {clientOnLeft ? (
            <>
              {clientView}
              {invoiceForView}
              {invoiceMetaView}
            </>
          ) : (
            <>
              {invoiceMetaView}
              {invoiceForView}
              {clientView}
            </>
          )}
        </View>

        {/* Table header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.colDesc, styles.tableHeaderText]}>
            Description
          </Text>
          {c.showHoursColumn && (
            <Text style={[styles.colHours, styles.tableHeaderText]}>Hours</Text>
          )}
          {c.showRateColumn && (
            <Text style={[styles.colRate, styles.tableHeaderText]}>
              Rate (£)
            </Text>
          )}
          <Text style={[styles.colTotal, styles.tableHeaderText]}>
            Total (£)
          </Text>
        </View>

        {/* Rows */}
        {entries.map((entry, index) => {
          const amount =
            (entry.minutes / 60) * Number.parseFloat(entry.ratePerHour);
          const isLast = index === entries.length - 1;
          return (
            <View
              key={entry.id}
              style={{
                ...styles.tableRow,
                ...(isLast ? { borderBottomWidth: 0 } : {}),
              }}
            >
              <Text style={styles.colDesc}>{entry.title}</Text>
              {c.showHoursColumn && (
                <Text style={styles.colHours}>
                  {formatHours(entry.minutes, c.hoursFormat)}
                </Text>
              )}
              {c.showRateColumn && (
                <Text style={styles.colRate}>
                  {formatGBP(entry.ratePerHour)}
                </Text>
              )}
              <Text style={styles.colTotal}>{formatGBP(amount)}</Text>
            </View>
          );
        })}

        {/* Grand Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          {c.showHoursColumn && (
            <Text style={styles.totalHours}>
              {formatHours(totalMinutes, c.hoursFormat)}
            </Text>
          )}
          {c.showRateColumn && <Text style={styles.totalRate} />}
          <Text style={styles.totalValue}>{formatGBP(totalAmount)}</Text>
        </View>

        {/* Footer */}
        {resolvedFooter && (
          <View style={styles.footer}>
            {resolvedFooter.split("\n").map((line) => (
              <Text key={line}>
                {parseFooterBold(line).map((seg) =>
                  seg.bold ? (
                    <Text
                      key={`b-${seg.text}`}
                      style={{ fontFamily: "Helvetica-Bold" }}
                    >
                      {seg.text}
                    </Text>
                  ) : (
                    <Text key={`n-${seg.text}`}>{seg.text}</Text>
                  ),
                )}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

interface PreviewDocProps {
  config: InvoiceTemplateConfig;
  profile: FooterProfileData;
}

export function InvoicePdfPreviewDoc({ config, profile }: PreviewDocProps) {
  const totalAmount = sampleEntries.reduce(
    (sum, e) => sum + (e.minutes / 60) * Number.parseFloat(e.ratePerHour),
    0,
  );

  const invoice: Invoice = {
    id: "preview",
    userId: "preview",
    clientId: "preview",
    invoiceNumber: "260309A",
    status: "draft",
    totalAmount: totalAmount.toFixed(2),
    issuedAt: "2026-03-09",
    paidAt: null,
    createdAt: new Date(),
  };

  const client: Client = {
    id: "preview",
    userId: "preview",
    name: "Acme Corp Ltd",
    email: "accounts@acme.example.com",
    addressLine1: "123 Business Street",
    addressLine2: "London",
    county: "",
    postcode: "SW1A 1AA",
    vatNumber: "GB123456789",
    createdAt: new Date(),
  };

  const user: User = {
    id: "preview",
    email: profile.email,
    name: profile.name,
    passwordHash: "",
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    county: profile.county,
    postcode: profile.postcode,
    mobile: profile.mobile,
    bankName: profile.bankName,
    accountNumber: profile.accountNumber,
    sortCode: profile.sortCode,
    invoiceTemplate: JSON.stringify(config),
    twoFactorMethod: null,
    totpSecret: null,
    backupCodes: null,
    termsAcceptedAt: null,
    createdAt: new Date(),
  };

  return (
    <InvoicePdf
      invoice={invoice}
      client={client}
      entries={sampleEntries}
      user={user}
    />
  );
}
