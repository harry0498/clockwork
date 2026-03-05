import { getClients } from "@/actions/clients";
import { getDashboardStats } from "@/actions/dashboard";
import { getEntries } from "@/actions/entries";
import { QuickLog } from "@/components/quick-log";
import {
  formatGBP,
  formatMinutes,
  getCurrentTaxYearStart,
  getTaxYearBounds,
} from "@/lib/tax-year";

export default async function DashboardPage() {
  const [stats, recentEntries, clients] = await Promise.all([
    getDashboardStats(),
    getEntries({ sortBy: "date", sortDir: "desc", limit: 5 }),
    getClients(),
  ]);

  const taxYear = getTaxYearBounds(getCurrentTaxYearStart());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Tax year {taxYear.label}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Hours"
          value={formatMinutes(stats.totalMinutes)}
        />
        <StatCard label="Total Earned" value={formatGBP(stats.totalEarned)} />
        <StatCard
          label="Unbilled Hours"
          value={formatMinutes(stats.unbilledMinutes)}
        />
        <StatCard
          label="Unbilled Amount"
          value={formatGBP(stats.unbilledAmount)}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Log</h2>
        <QuickLog clients={clients} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Entries</h2>
        {recentEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Client</th>
                  <th className="px-4 py-2 text-left font-medium">Title</th>
                  <th className="px-4 py-2 text-right font-medium">Time</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((entry) => {
                  const amount =
                    (entry.minutes / 60) * Number.parseFloat(entry.ratePerHour);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-2">{entry.date}</td>
                      <td className="px-4 py-2">{entry.client.name}</td>
                      <td className="px-4 py-2">{entry.title}</td>
                      <td className="px-4 py-2 text-right">
                        {formatMinutes(entry.minutes)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {formatGBP(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
