import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    paddingBottom: 6,
    marginBottom: 2,
  },
  col: {
    flex: 1,
  },
  colRight: {
    flex: 1,
    textAlign: "right",
  },
  colSmall: {
    width: 60,
    textAlign: "right",
  },
  colDate: {
    width: 70,
  },
  colDesc: {
    flex: 2,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#333",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    flex: 3,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    paddingRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  metaBlock: {
    width: "45%",
  },
  status: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    marginTop: 4,
  },
});

function formatGBP(amount: number | string): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return `£${num.toFixed(2)}`;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface InvoicePdfProps {
  invoice: {
    invoiceNumber: string;
    status: string;
    totalAmount: string;
    issuedAt: string;
    paidAt: string | null;
  };
  client: {
    name: string;
    email: string | null;
    address: string | null;
  };
  entries: Array<{
    date: string;
    title: string;
    minutes: number;
    ratePerHour: string;
  }>;
}

export function InvoicePdf({ invoice, client, entries }: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.subtitle}>{invoice.invoiceNumber}</Text>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.clientName}>{client.name}</Text>
            {client.email && <Text>{client.email}</Text>}
            {client.address && <Text>{client.address}</Text>}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text>Date: {invoice.issuedAt}</Text>
            <Text style={styles.status}>Status: {invoice.status}</Text>
            {invoice.paidAt && <Text>Paid: {invoice.paidAt}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={[styles.colDate, styles.bold]}>Date</Text>
            <Text style={[styles.colDesc, styles.bold]}>Description</Text>
            <Text style={[styles.colSmall, styles.bold]}>Time</Text>
            <Text style={[styles.colSmall, styles.bold]}>Rate</Text>
            <Text style={[styles.colSmall, styles.bold]}>Amount</Text>
          </View>

          {entries.map((entry) => {
            const amount =
              (entry.minutes / 60) * Number.parseFloat(entry.ratePerHour);
            return (
              <View key={`${entry.date}-${entry.title}`} style={styles.row}>
                <Text style={styles.colDate}>{entry.date}</Text>
                <Text style={styles.colDesc}>{entry.title}</Text>
                <Text style={styles.colSmall}>
                  {formatMinutes(entry.minutes)}
                </Text>
                <Text style={styles.colSmall}>
                  {formatGBP(entry.ratePerHour)}
                </Text>
                <Text style={styles.colSmall}>{formatGBP(amount)}</Text>
              </View>
            );
          })}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatGBP(invoice.totalAmount)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
