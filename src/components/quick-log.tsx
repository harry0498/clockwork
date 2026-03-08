"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEntry } from "@/actions/entries";
import { Alert } from "@/components/alert";
import { inputClassName } from "@/lib/constants";
import { todayISO } from "@/lib/tax-year";
import type { ClientPick } from "@/lib/types";

export function QuickLog({ clients }: { clients: ClientPick[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createEntry(formData);
      e.currentTarget.reset();
      setRate("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const today = todayISO();

  if (clients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a client first to start logging time.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <Alert message={error} variant="error" />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select name="clientId" required className={inputClassName}>
          <option value="">Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="title"
          type="text"
          required
          placeholder="What did you work on?"
          className={inputClassName}
        />
        <input
          name="minutes"
          type="number"
          required
          min={1}
          placeholder="Minutes"
          className={inputClassName}
        />
        <input
          name="ratePerHour"
          type="text"
          inputMode="decimal"
          required
          placeholder="£/hr"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className={inputClassName}
        />
      </div>
      <input name="date" type="hidden" value={today} />
      <input name="notes" type="hidden" value="" />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Logging..." : "Quick Log"}
      </button>
    </form>
  );
}
