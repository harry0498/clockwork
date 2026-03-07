import Link from "next/link";
import { getClients } from "@/actions/clients";
import { getDashboardStats, getOnboardingStatus } from "@/actions/dashboard";
import { getEntries } from "@/actions/entries";
import { QuickLog } from "@/components/quick-log";
import {
  formatGBP,
  formatMinutes,
  getCurrentTaxYearStart,
  getTaxYearBounds,
} from "@/lib/tax-year";

export default async function DashboardPage() {
  const onboarding = await getOnboardingStatus();
  const onboardingComplete =
    onboarding.hasClients && onboarding.hasEntries && onboarding.hasInvoices;

  if (!onboarding.hasClients) {
    return <GettingStarted onboarding={onboarding} />;
  }

  const [stats, recentEntries, clients] = await Promise.all([
    getDashboardStats(),
    getEntries({ sortBy: "date", sortDir: "desc", limit: 5 }),
    getClients(),
  ]);

  const taxYear = getTaxYearBounds(getCurrentTaxYearStart());

  const remainingSteps = steps.filter((step) => !onboarding[step.key]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Tax year {taxYear.label}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatGroup
          label="Hours"
          total={formatMinutes(stats.totalMinutes)}
          invoiced={formatMinutes(stats.billedMinutes)}
          unbilled={formatMinutes(stats.unbilledMinutes)}
        />
        <StatGroup
          label="Earnings"
          total={formatGBP(stats.totalEarned)}
          invoiced={formatGBP(stats.billedAmount)}
          unbilled={formatGBP(stats.unbilledAmount)}
        />
      </div>

      {!onboardingComplete && remainingSteps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Next Steps</h2>
          <div className="space-y-2">
            {remainingSteps.map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground">
                  {step.num}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                <Link
                  href={step.href}
                  className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  {step.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {clients.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Log</h2>
          <QuickLog clients={clients} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Entries</h2>
        {recentEntries.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
            <p className="text-muted-foreground">Ready to track some time?</p>
            <Link
              href="/entries/new"
              className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Log Time
            </Link>
          </div>
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

function StatGroup({
  label,
  total,
  invoiced,
  unbilled,
}: {
  label: string;
  total: string;
  invoiced: string;
  unbilled: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{total}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2 text-sm">
        <p className="text-green-600">Invoiced: {invoiced}</p>
        <p className="text-amber-600">Unbilled: {unbilled}</p>
      </div>
    </div>
  );
}

const steps = [
  {
    num: 1,
    key: "hasClients" as const,
    title: "Add your first client",
    description: "You'll need at least one client to track time against",
    href: "/clients/new",
    cta: "Add Client",
  },
  {
    num: 2,
    key: "hasEntries" as const,
    title: "Log your first time entry",
    description: "Track the work you do for your clients",
    href: "/entries/new",
    cta: "Log Time",
  },
  {
    num: 3,
    key: "hasInvoices" as const,
    title: "Create your first invoice",
    description: "Bill your client for the time you've logged",
    href: "/invoices/new",
    cta: "Create Invoice",
  },
];

function GettingStarted({
  onboarding,
}: {
  onboarding: {
    hasClients: boolean;
    hasEntries: boolean;
    hasInvoices: boolean;
  };
}) {
  const nextStep = !onboarding.hasClients ? 1 : !onboarding.hasEntries ? 2 : 3;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Get Started</h1>
        <p className="mt-1 text-muted-foreground">
          Complete these steps to start invoicing
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const done = onboarding[step.key];
          const isNext = step.num === nextStep;
          const prereqUnmet = step.num > nextStep;

          return (
            <div
              key={step.num}
              className={`rounded-lg border p-4 ${
                done
                  ? "border-border bg-muted/30"
                  : isNext
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      role="img"
                      aria-label="Complete"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {isNext && (
                    <Link
                      href={step.href}
                      className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      {step.cta}
                    </Link>
                  )}
                  {prereqUnmet && !done && (
                    <Link
                      href={step.href}
                      className="mt-3 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      {step.cta}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
