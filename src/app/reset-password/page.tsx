"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { resetPassword } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { type ResetPasswordInput, resetPasswordSchema } from "@/lib/validators";

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
          className="block text-center text-sm font-medium text-indigo-700 hover:text-indigo-600"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 text-emerald-800 text-sm p-3 rounded-md">
          Your password has been reset successfully.
        </div>
        <Link
          href="/login"
          className="block text-center text-sm font-medium text-indigo-700 hover:text-indigo-600"
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
          className="text-sm font-medium text-stone-700"
        >
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-stone-700"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
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
        className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700/90 disabled:opacity-50"
      >
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Logo size={28} />
            <h1 className="text-2xl font-bold text-stone-900">Clockwork</h1>
          </div>
          <p className="text-stone-500 text-sm mt-1">Set a new password</p>
        </div>

        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
