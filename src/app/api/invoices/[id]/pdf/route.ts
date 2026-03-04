import { renderToBuffer } from "@react-pdf/renderer";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { InvoicePdf } from "@/lib/invoice-pdf";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	const invoice = await db.query.invoices.findFirst({
		where: and(
			eq(invoices.id, id),
			eq(invoices.userId, session.user.id),
		),
		with: {
			client: true,
			timeEntries: true,
		},
	});

	if (!invoice) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const buffer = await renderToBuffer(
		InvoicePdf({
			invoice: {
				invoiceNumber: invoice.invoiceNumber,
				status: invoice.status,
				totalAmount: invoice.totalAmount,
				issuedAt: invoice.issuedAt,
				paidAt: invoice.paidAt,
			},
			client: {
				name: invoice.client.name,
				email: invoice.client.email,
				address: invoice.client.address,
			},
			entries: invoice.timeEntries.map((e) => ({
				date: e.date,
				title: e.title,
				minutes: e.minutes,
				ratePerHour: e.ratePerHour,
			})),
		}),
	);

	const uint8 = new Uint8Array(buffer);
	return new NextResponse(uint8, {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
		},
	});
}
