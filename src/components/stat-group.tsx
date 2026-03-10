import { formatGBP, formatMinutes } from "@/lib/tax-year";

export function StatGroup({
  variant,
  total,
  invoiced,
  uninvoiced,
  paid,
}: {
  variant: "hours" | "earnings";
  total: number;
  invoiced: number;
  uninvoiced: number;
  paid: number;
}) {
  const fmt = variant === "hours" ? formatMinutes : formatGBP;
  const label = variant === "hours" ? "Hours" : "Earnings";
  const awaitingPayment = invoiced - paid;

  const segments = [
    {
      label: "Uninvoiced",
      value: uninvoiced,
      color: "bg-amber-500",
      dot: "bg-amber-500",
    },
    {
      label: "Invoiced",
      value: awaitingPayment,
      color: "bg-indigo-500",
      dot: "bg-indigo-500",
    },
    {
      label: "Paid",
      value: paid,
      color: "bg-emerald-500",
      dot: "bg-emerald-500",
    },
  ];

  const barTotal = uninvoiced + awaitingPayment + paid;

  function segmentWidth(value: number): string {
    if (barTotal === 0) return "0%";
    const pct = (value / barTotal) * 100;
    if (value > 0 && pct < 1) return "1%";
    return `${pct}%`;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{fmt(total)}</p>

      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all`}
            style={{ width: segmentWidth(seg.value) }}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {segments.map((seg) => (
          <div key={seg.label}>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${seg.dot}`}
              />
              <span className="text-xs text-muted-foreground">{seg.label}</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold">{fmt(seg.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
