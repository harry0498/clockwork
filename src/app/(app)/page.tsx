import { Check } from "lucide-react";
import Link from "next/link";
import { getClients } from "@/actions/clients";
import { getDashboardStats, getOnboardingStatus } from "@/actions/dashboard";
import { getEntries } from "@/actions/entries";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { QuickLog } from "@/components/quick-log";
import { StatGroup } from "@/components/stat-group";
import { buttonClassName } from "@/lib/constants";
import {
  calculateAmount,
  formatGBP,
  formatMinutes,
  getCurrentTaxYearStart,
  getTaxYearBounds,
} from "@/lib/tax-year";
import type { TimeEntryWithClient } from "@/lib/types";

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
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Tax year {taxYear.label}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatGroup
          variant="hours"
          total={stats.totalMinutes}
          invoiced={stats.billedMinutes}
          uninvoiced={stats.unbilledMinutes}
          paid={stats.paidMinutes}
        />
        <StatGroup
          variant="earnings"
          total={stats.totalEarned}
          invoiced={stats.billedAmount}
          uninvoiced={stats.unbilledAmount}
          paid={stats.paidAmount}
        />
      </div>

      {!onboardingComplete && remainingSteps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Next Steps</h2>
          <div className="space-y-2">
            {remainingSteps.map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-3 rounded-lg border border-primary/20 bg-accent p-3"
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
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {step.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {clients.length > 0 && <QuickLog clients={clients} />}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Entries</h2>
        {recentEntries.length === 0 ? (
          <EmptyState
            message="Ready to track some time?"
            actionLabel="Log Time"
            actionHref="/entries/new"
          />
        ) : (
          <DataTable<TimeEntryWithClient>
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Client", accessor: (e) => e.client.name },
              { header: "Title", accessor: "title" },
              {
                header: "Time",
                accessor: (e) => formatMinutes(e.minutes),
                align: "right",
              },
              {
                header: "Amount",
                accessor: (e) =>
                  formatGBP(calculateAmount(e.minutes, e.ratePerHour)),
                align: "right",
              },
            ]}
            data={recentEntries}
            keyExtractor={(e) => e.id}
          />
        )}
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
                    ? "border-primary/20 bg-accent"
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
                  {done ? <Check className="h-4 w-4" /> : step.num}
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
                      className={`mt-3 inline-block ${buttonClassName}`}
                    >
                      {step.cta}
                    </Link>
                  )}
                  {prereqUnmet && !done && (
                    <Link
                      href={step.href}
                      className="mt-3 inline-block rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
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
