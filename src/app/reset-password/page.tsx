"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { type ResetPasswordInput, resetPasswordSchema } from "@/lib/validators";

const inputClassName =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-card-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  async function onSubmit(data: ResetPasswordInput) {
    const result = await resetPassword(data);
    if (result.success) {
      setSuccess(true);
    } else {
      setError("root", { message: result.error });
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          Invalid reset link. Please request a new one.
        </div>
        <Link
          href="/forgot-password"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 text-sm p-3 rounded-md">
          Your password has been reset successfully.
        </div>
        <Link
          href="/login"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {errors.root.message}
        </div>
      )}

      <input type="hidden" {...register("token")} />

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-card-foreground"
        >
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className={inputClassName}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-card-foreground"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className={inputClassName}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 dark:from-[#08071a] dark:via-[#100e28] dark:to-[#08071a]">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-card p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Logo size={28} />
            <h1 className="text-2xl font-bold text-card-foreground">
              Clockwork
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Set a new password
          </p>
        </div>

        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
