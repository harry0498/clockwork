"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEntry, updateEntry } from "@/actions/entries";
import { Alert } from "@/components/alert";
import { inputClassName } from "@/lib/constants";
import { todayISO } from "@/lib/tax-year";
import type { ClientPick, TimeEntry } from "@/lib/types";

interface EntryFormProps {
  clients: ClientPick[];
  entry?: Pick<
    TimeEntry,
    "id" | "clientId" | "title" | "notes" | "minutes" | "ratePerHour" | "date"
  >;
}

export function EntryForm({ clients, entry }: EntryFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(entry?.ratePerHour ?? "");
  const isEditing = !!entry;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (isEditing) {
        await updateEntry(entry.id, formData);
      } else {
        await createEntry(formData);
      }
      router.push("/entries");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const today = todayISO();

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && <Alert message={error} variant="error" />}

      <div className="space-y-2">
        <label htmlFor="clientId" className="text-sm font-medium">
          Client *
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          defaultValue={entry?.clientId ?? ""}
          className={inputClassName}
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={entry?.title ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={entry?.notes ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="minutes" className="text-sm font-medium">
            Minutes *
          </label>
          <input
            id="minutes"
            name="minutes"
            type="number"
            required
            min={1}
            max={1440}
            defaultValue={entry?.minutes ?? ""}
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="ratePerHour" className="text-sm font-medium">
            Rate (£/hr) *
          </label>
          <input
            id="ratePerHour"
            name="ratePerHour"
            type="text"
            inputMode="decimal"
            required
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium">
          Date *
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={entry?.date ?? today}
          className={inputClassName}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Entry" : "Log Time"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
