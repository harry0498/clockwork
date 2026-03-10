"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useRef, useState } from "react";
import { verifyTwoFactor } from "@/actions/auth";
import { Logo } from "@/components/logo";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pendingToken = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const method = searchParams.get("method") ?? "totp";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!pendingToken) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          Invalid verification session. Please log in again.
        </div>
        <Link
          href="/login"
          className="block text-center text-sm font-medium text-indigo-700 hover:text-indigo-600"
        >
          Back to login
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    const result = await verifyTwoFactor({
      pendingToken,
      code: code.trim(),
      isBackupCode: useBackup,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Use bypass token to complete sign-in
    const signInResult = await signIn("credentials", {
      email,
      password: "",
      twoFactorBypassToken: result.bypassToken,
      redirect: false,
    });

    if (signInResult?.error) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <p className="text-sm text-stone-600">
        {useBackup
          ? "Enter one of your backup codes."
          : method === "email"
            ? "We sent a 6-digit code to your email."
            : "Enter the 6-digit code from your authenticator app."}
      </p>

      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium text-stone-700">
          {useBackup ? "Backup code" : "Verification code"}
        </label>
        <input
          ref={inputRef}
          id="code"
          type="text"
          inputMode={useBackup ? "text" : "numeric"}
          autoComplete="one-time-code"
          maxLength={useBackup ? 8 : 6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition-colors placeholder:text-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-center tracking-[0.3em] font-mono"
          placeholder={useBackup ? "xxxxxxxx" : "000000"}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700/90 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setUseBackup(!useBackup);
            setCode("");
            setError("");
          }}
          className="text-indigo-700 hover:text-indigo-600 font-medium"
        >
          {useBackup ? "Use verification code" : "Use backup code"}
        </button>
        <Link href="/login" className="text-stone-500 hover:text-stone-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function VerifyTwoFactorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Logo size={28} />
            <h1 className="text-2xl font-bold text-stone-900">Clockwork</h1>
          </div>
          <p className="text-stone-500 text-sm mt-1">
            Two-factor authentication
          </p>
        </div>

        <Suspense>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
