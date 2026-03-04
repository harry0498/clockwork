import Link from "next/link";
import { getClients } from "@/actions/clients";
import { ClientDeleteButton } from "@/components/client-delete-button";

export default async function ClientsPage() {
	const clientList = await getClients();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Clients</h1>
				<Link
					href="/clients/new"
					className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
				>
					New Client
				</Link>
			</div>

			{clientList.length === 0 ? (
				<p className="text-muted-foreground">
					No clients yet. Add your first client to get started.
				</p>
			) : (
				<div className="overflow-x-auto rounded-md border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/50">
								<th className="px-4 py-3 text-left font-medium">Name</th>
								<th className="px-4 py-3 text-left font-medium">Email</th>
								<th className="px-4 py-3 text-right font-medium">
									Default Rate
								</th>
								<th className="px-4 py-3 text-right font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{clientList.map((client) => (
								<tr
									key={client.id}
									className="border-b border-border last:border-0"
								>
									<td className="px-4 py-3 font-medium">{client.name}</td>
									<td className="px-4 py-3 text-muted-foreground">
										{client.email || "—"}
									</td>
									<td className="px-4 py-3 text-right">
										{client.defaultRate
											? `£${Number(client.defaultRate).toFixed(2)}/hr`
											: "—"}
									</td>
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-2">
											<Link
												href={`/clients/new?id=${client.id}`}
												className="text-sm text-muted-foreground hover:text-foreground"
											>
												Edit
											</Link>
											<ClientDeleteButton
												clientId={client.id}
												clientName={client.name}
											/>
										</div>
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
