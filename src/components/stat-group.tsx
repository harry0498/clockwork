import { formatGBP, formatMinutes } from "@/lib/tax-year";

function BreakdownRow({
  leftLabel,
  leftValue,
  leftRaw,
  rightLabel,
  rightValue,
  rightRaw,
  leftColor,
  rightColor,
  leftBarColor,
  rightBarColor,
}: {
  leftLabel: string;
  leftValue: string;
  leftRaw: number;
  rightLabel: string;
  rightValue: string;
  rightRaw: number;
  leftColor: string;
  rightColor: string;
  leftBarColor: string;
  rightBarColor: string;
}) {
  const total = leftRaw + rightRaw;
  const leftPercent = total > 0 ? (leftRaw / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{leftLabel}</p>
          <p className={`text-sm font-semibold ${leftColor}`}>{leftValue}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{rightLabel}</p>
          <p className={`text-sm font-semibold ${rightColor}`}>{rightValue}</p>
        </div>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`${leftBarColor} rounded-l-full transition-all`}
          style={{ width: `${leftPercent}%` }}
        />
        <div
          className={`${rightBarColor} rounded-r-full transition-all`}
          style={{ width: `${100 - leftPercent}%` }}
        />
      </div>
    </div>
  );
}

export function StatGroup({
  variant,
  total,
  invoiced,
  uninvoiced,
  paid,
  unpaid,
}: {
  variant: "hours" | "earnings";
  total: number;
  invoiced: number;
  uninvoiced: number;
  paid: number;
  unpaid: number;
}) {
  const fmt = variant === "hours" ? formatMinutes : formatGBP;
  const label = variant === "hours" ? "Hours" : "Earnings";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{fmt(total)}</p>
      <div className="mt-3 space-y-3 border-t border-border pt-3">
        <BreakdownRow
          leftLabel="Invoiced"
          leftValue={fmt(invoiced)}
          leftRaw={invoiced}
          rightLabel="Uninvoiced"
          rightValue={fmt(uninvoiced)}
          rightRaw={uninvoiced}
          leftColor="text-green-600 dark:text-green-400"
          rightColor="text-amber-600 dark:text-amber-400"
          leftBarColor="bg-green-600"
          rightBarColor="bg-amber-500"
        />
        <BreakdownRow
          leftLabel="Paid"
          leftValue={fmt(paid)}
          leftRaw={paid}
          rightLabel="Unpaid"
          rightValue={fmt(unpaid)}
          rightRaw={unpaid}
          leftColor="text-emerald-600 dark:text-emerald-400"
          rightColor="text-red-600 dark:text-red-400"
          leftBarColor="bg-emerald-600"
          rightBarColor="bg-red-500"
        />
      </div>
    </div>
  );
}
