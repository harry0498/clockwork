"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEntry } from "@/actions/entries";
import { inputClassName } from "@/lib/constants";
import { todayISO } from "@/lib/tax-year";
import { showErrorToast } from "@/lib/toast-helpers";
import type { ClientPick } from "@/lib/types";
import { type EntryInput, entrySchema } from "@/lib/validators";

export function QuickLog({ clients }: { clients: ClientPick[] }) {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = todayISO();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      clientId: clients.length === 1 ? clients[0].id : "",
      title: "",
      notes: "",
      minutes: NaN,
      ratePerHour: "",
      date: today,
    },
  });

  const hasErrors =
    errors.clientId || errors.title || errors.minutes || errors.ratePerHour;

  async function onSubmit(data: EntryInput) {
    try {
      await createEntry(data);
      reset({
        clientId: data.clientId,
        title: "",
        notes: "",
        minutes: NaN,
        ratePerHour: data.ratePerHour,
        date: today,
      });
      router.refresh();
      titleRef.current?.focus();
      setShowSuccess(true);
      toast.success("Time logged");
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      showErrorToast(err);
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
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Clock className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Quick Log</h2>
        {showSuccess && (
          <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Logged!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_auto_auto_auto]">
          <div>
            <select {...register("clientId")} className={inputClassName}>
              <option value="">Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-xs text-destructive">
                {errors.clientId.message}
              </p>
            )}
          </div>

          <div>
            {(() => {
              const { ref, ...rest } = register("title");
              return (
                <input
                  type="text"
                  placeholder="What did you work on?"
                  ref={(el) => {
                    ref(el);
                    titleRef.current = el;
                  }}
                  {...rest}
                  className={inputClassName}
                />
              );
            })()}
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="number"
              min={1}
              placeholder="Minutes"
              {...register("minutes", { valueAsNumber: true })}
              className={`${inputClassName} sm:w-24`}
            />
            {errors.minutes && (
              <p className="mt-1 text-xs text-destructive">
                {errors.minutes.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              inputMode="decimal"
              placeholder="£/hr"
              {...register("ratePerHour")}
              className={`${inputClassName} sm:w-20`}
            />
            {errors.ratePerHour && (
              <p className="mt-1 text-xs text-destructive">
                {errors.ratePerHour.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-[42px] w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sm:sr-only">
                {isSubmitting ? "Logging..." : "Log"}
              </span>
            </button>
          </div>
        </div>

        <input type="hidden" {...register("date")} />
        <input type="hidden" {...register("notes")} />

        {hasErrors && (
          <p className="mt-3 text-xs text-destructive sm:hidden">
            {errors.clientId?.message ??
              errors.title?.message ??
              errors.minutes?.message ??
              errors.ratePerHour?.message}
          </p>
        )}
      </form>
    </div>
  );
}
