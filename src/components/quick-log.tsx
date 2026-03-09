"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEntry } from "@/actions/entries";
import { inputClassName } from "@/lib/constants";
import { todayISO } from "@/lib/tax-year";
import type { ClientPick } from "@/lib/types";
import { type EntryInput, entrySchema } from "@/lib/validators";

export function QuickLog({ clients }: { clients: ClientPick[] }) {
  const router = useRouter();

  const today = todayISO();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      clientId: "",
      title: "",
      notes: "",
      minutes: NaN,
      ratePerHour: "",
      date: today,
    },
  });

  async function onSubmit(data: EntryInput) {
    try {
      await createEntry(data);
      reset({
        clientId: "",
        title: "",
        notes: "",
        minutes: NaN,
        ratePerHour: "",
        date: today,
      });
      router.refresh();
      toast.success("Time logged");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (clients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a client first to start logging time.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {(errors.clientId ||
        errors.title ||
        errors.minutes ||
        errors.ratePerHour) && (
        <p className="text-sm text-destructive">
          {errors.clientId?.message ??
            errors.title?.message ??
            errors.minutes?.message ??
            errors.ratePerHour?.message}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select {...register("clientId")} className={inputClassName}>
          <option value="">Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="What did you work on?"
          {...register("title")}
          className={inputClassName}
        />
        <input
          type="number"
          min={1}
          placeholder="Minutes"
          {...register("minutes", { valueAsNumber: true })}
          className={inputClassName}
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="£/hr"
          {...register("ratePerHour")}
          className={inputClassName}
        />
      </div>
      <input type="hidden" {...register("date")} />
      <input type="hidden" {...register("notes")} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Logging..." : "Quick Log"}
      </button>
    </form>
  );
}
