import { renderToBuffer } from "@react-pdf/renderer";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { invoices, users } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { InvoicePdf } from "@/lib/invoice-pdf";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { allowed } = checkRateLimit(`pdf:${session.user.id}`, 20);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const invoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, id), eq(invoices.userId, session.user.id)),
    with: {
      client: true,
      timeEntries: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      name: true,
      email: true,
      addressLine1: true,
      addressLine2: true,
      county: true,
      postcode: true,
      mobile: true,
      bankName: true,
      accountNumber: true,
      sortCode: true,
      invoiceTemplate: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    InvoicePdf({
      invoice,
      client: invoice.client,
      entries: invoice.timeEntries,
      user,
    }),
  );

  const uint8 = new Uint8Array(buffer);
  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf"`,
    },
  });
}
