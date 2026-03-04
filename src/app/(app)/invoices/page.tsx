import Link from "next/link";
import { getInvoices } from "@/actions/invoices";
import { TaxYearFilter } from "@/components/tax-year-filter";
import { getCurrentTaxYearStart } from "@/lib/tax-year";
import { formatGBP } from "@/lib/tax-year";

const statusColors: Record<string, string> = {
	draft: "bg-muted text-muted-foreground",
	sent: "bg-blue-100 text-blue-800",
	paid: "bg-green-100 text-green-800",
};

export default async function InvoicesPage({
	searchParams,
}: {
	searchParams: Promise<{ taxYear?: string }>;
}) {
	const params = await searchParams;
	const taxYear = params.taxYear
		? Number.parseInt(params.taxYear, 10)
		: getCurrentTaxYearStart();

	const invoiceList = await getInvoices(taxYear);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Invoices</h1>
				<Link
					href="/invoices/new"
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
				>
					New Invoice
				</Link>
			</div>

			<TaxYearFilter basePath="/invoices" />

			{invoiceList.length === 0 ? (
				<p className="text-muted-foreground">No invoices for this tax year.</p>
			) : (
				<div className="overflow-x-auto rounded-md border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/50">
								<th className="px-4 py-3 text-left font-medium">Number</th>
								<th className="px-4 py-3 text-left font-medium">Client</th>
								<th className="px-4 py-3 text-left font-medium">Date</th>
								<th className="px-4 py-3 text-right font-medium">Total</th>
								<th className="px-4 py-3 text-center font-medium">Status</th>
							</tr>
						</thead>
						<tbody>
							{invoiceList.map((inv) => (
								<tr
									key={inv.id}
									className="border-b border-border last:border-0"
								>
									<td className="px-4 py-3">
										<Link
											href={`/invoices/${inv.id}`}
											className="font-medium hover:underline"
										>
											{inv.invoiceNumber}
										</Link>
									</td>
									<td className="px-4 py-3">{inv.client.name}</td>
									<td className="px-4 py-3">{inv.issuedAt}</td>
									<td className="px-4 py-3 text-right font-medium">
										{formatGBP(inv.totalAmount)}
									</td>
									<td className="px-4 py-3 text-center">
										<span
											className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[inv.status]}`}
										>
											{inv.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
