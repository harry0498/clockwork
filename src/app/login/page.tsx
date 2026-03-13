"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/logo";
import { buttonClassName } from "@/lib/constants";
import { type LoginInput, loginSchema } from "@/lib/validators";

const TWO_FA_PREFIX = "2FA_REQUIRED:";

const inputClassName =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-card-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes(TWO_FA_PREFIX)) {
        // Extract pending token and method from error
        const payload = result.error.split(TWO_FA_PREFIX)[1];
        const [token, method] = payload.split("|");
        const params = new URLSearchParams({
          token,
          email: data.email,
          method: method ?? "totp",
        });
        router.push(`/verify-2fa?${params.toString()}`);
        return;
      }
      setError("root", { message: "Invalid email or password" });
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-2xl bg-card p-8 shadow-2xl">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Logo size={28} />
          <h1 className="text-2xl font-bold text-card-foreground">Clockwork</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Sign in to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {registered && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm p-3 rounded-md">
            If that email is available, your account has been created. Please
            sign in.
          </div>
        )}
        {errors.root && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {errors.root.message}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-card-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={inputClassName}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-card-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={inputClassName}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${buttonClassName}`}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:text-primary/80"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 dark:from-[#08071a] dark:via-[#100e28] dark:to-[#08071a]">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
