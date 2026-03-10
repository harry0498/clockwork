"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { requestPasswordReset } from "@/actions/auth";
import { Logo } from "@/components/logo";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/validators";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    const result = await requestPasswordReset(data);
    if (result.success) {
      setSent(true);
    } else {
      setError("root", { message: result.error });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Logo size={28} />
            <h1 className="text-2xl font-bold text-stone-900">Clockwork</h1>
          </div>
          <p className="text-stone-500 text-sm mt-1">Reset your password</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 text-emerald-800 text-sm p-3 rounded-md">
              If an account with that email exists, we&apos;ve sent a password
              reset link. Check your inbox.
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-indigo-700 hover:text-indigo-600"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {errors.root.message}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700/90 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-sm text-stone-500">
              <Link
                href="/login"
                className="font-medium text-indigo-700 hover:text-indigo-600"
              >
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
