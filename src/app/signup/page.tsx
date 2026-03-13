"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { signup } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { PrivacyContent } from "@/components/privacy-content";
import { TermsContent } from "@/components/terms-content";
import { buttonClassName } from "@/lib/constants";
import { type SignupInput, signupSchema } from "@/lib/validators";

const inputClassName =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-card-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30";

export default function SignupPage() {
  const router = useRouter();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: undefined as unknown as true,
    },
  });

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || hasScrolledToBottom) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  async function onSubmit(data: SignupInput) {
    const result = await signup(data);

    if (!result.success) {
      setError("root", { message: result.error });
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 dark:from-[#08071a] dark:via-[#100e28] dark:to-[#08071a] px-4 py-8">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-card p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Logo size={28} />
            <h1 className="text-2xl font-bold text-card-foreground">
              Clockwork
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-card-foreground"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className={inputClassName}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

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
              autoComplete="new-password"
              {...register("password")}
              className={inputClassName}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-card-foreground"
            >
              Confirm password
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

          {/* Legal content scroll container */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-card-foreground">
              Terms &amp; Privacy Policy
            </span>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-[200px] overflow-y-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed text-muted-foreground scroll-smooth"
            >
              <TermsContent />
              <div className="my-4 border-t border-border" />
              <PrivacyContent />
            </div>
            {!hasScrolledToBottom && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
                Scroll to the bottom to continue
              </p>
            )}
            <div className="flex items-start gap-2 mt-1">
              <input
                id="acceptTerms"
                type="checkbox"
                disabled={!hasScrolledToBottom}
                onChange={(e) =>
                  setValue("acceptTerms", e.target.checked as true, {
                    shouldValidate: true,
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <label
                htmlFor="acceptTerms"
                className={`text-sm select-none ${hasScrolledToBottom ? "text-card-foreground" : "text-muted-foreground"}`}
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium text-primary hover:text-primary/80 underline"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-medium text-primary hover:text-primary/80 underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${buttonClassName}`}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
