"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEntry, updateEntry } from "@/actions/entries";
import { inputClassName } from "@/lib/constants";
import { todayISO } from "@/lib/tax-year";
import type { ClientPick, TimeEntry } from "@/lib/types";
import { type EntryInput, entrySchema } from "@/lib/validators";

export interface EntryFormProps {
  clients: ClientPick[];
  entry?: Pick<
    TimeEntry,
    "id" | "clientId" | "title" | "notes" | "minutes" | "ratePerHour" | "date"
  >;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EntryForm({
  clients,
  entry,
  onSuccess,
  onCancel,
}: EntryFormProps) {
  const router = useRouter();
  const isEditing = !!entry;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      clientId: entry?.clientId ?? "",
      title: entry?.title ?? "",
      notes: entry?.notes ?? "",
      minutes: entry?.minutes ?? NaN,
      ratePerHour: entry?.ratePerHour ?? "",
      date: entry?.date ?? todayISO(),
    },
  });

  async function onSubmit(data: EntryInput) {
    try {
      if (isEditing) {
        await updateEntry(entry.id, data);
      } else {
        await createEntry(data);
      }
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/entries");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="clientId" className="text-sm font-medium">
          Client *
        </label>
        <select
          id="clientId"
          {...register("clientId")}
          className={inputClassName}
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.clientId && (
          <p className="text-sm text-destructive">{errors.clientId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title *
        </label>
        <input
          id="title"
          type="text"
          maxLength={200}
          {...register("title")}
          className={inputClassName}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register("notes")}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30 resize-none"
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="minutes" className="text-sm font-medium">
            Minutes *
          </label>
          <input
            id="minutes"
            type="number"
            min={1}
            max={1440}
            {...register("minutes", { valueAsNumber: true })}
            className={inputClassName}
          />
          {errors.minutes && (
            <p className="text-sm text-destructive">{errors.minutes.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="ratePerHour" className="text-sm font-medium">
            Rate (£/hr) *
          </label>
          <input
            id="ratePerHour"
            type="text"
            inputMode="decimal"
            {...register("ratePerHour")}
            className={inputClassName}
          />
          {errors.ratePerHour && (
            <p className="text-sm text-destructive">
              {errors.ratePerHour.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium">
          Date *
        </label>
        <input
          id="date"
          type="date"
          {...register("date")}
          className={inputClassName}
        />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Entry" : "Log Time"}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
