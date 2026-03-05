"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteEntry } from "@/actions/entries";
import { formatGBP, formatMinutes } from "@/lib/tax-year";

interface Entry {
  id: string;
  title: string;
  minutes: number;
  ratePerHour: string;
  date: string;
  invoiceId: string | null;
  client: { id: string; name: string };
}

export function EntryTable({ entries }: { entries: Entry[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await deleteEntry(id);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground">No entries found for this period.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Client</th>
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-right font-medium">Time</th>
            <th className="px-4 py-3 text-right font-medium">Rate</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-center font-medium">Invoiced</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const amount =
              (entry.minutes / 60) * Number.parseFloat(entry.ratePerHour);
            return (
              <tr
                key={entry.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">{entry.date}</td>
                <td className="px-4 py-3">{entry.client.name}</td>
                <td className="px-4 py-3 font-medium">{entry.title}</td>
                <td className="px-4 py-3 text-right">
                  {formatMinutes(entry.minutes)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatGBP(entry.ratePerHour)}/hr
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatGBP(amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  {entry.invoiceId ? (
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!entry.invoiceId && (
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/entries/new?id=${entry.id}`}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="text-sm text-destructive hover:text-destructive/80"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
