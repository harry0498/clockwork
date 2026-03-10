"use client";

import { useCallback, useEffect, useState } from "react";
import {
  disableTwoFactor,
  enableEmailTwoFactor,
  enableTotp,
  generateTotpSetup,
  getTwoFactorStatus,
  regenerateBackupCodes,
} from "@/actions/two-factor";
import { inputClassName } from "@/lib/constants";

type Step =
  | { type: "idle" }
  | { type: "choose" }
  | {
      type: "totp-setup";
      secret: string;
      qrCodeUrl: string;
    }
  | { type: "backup-codes"; codes: string[] }
  | { type: "disable" }
  | { type: "regenerate" };

export function TwoFactorSettings() {
  const [status, setStatus] = useState<{
    method: string | null;
    backupCodesRemaining: number;
  } | null>(null);
  const [step, setStep] = useState<Step>({ type: "idle" });
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    const s = await getTwoFactorStatus();
    setStatus(s);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function handleStartTotp() {
    setLoading(true);
    setError("");
    const result = await generateTotpSetup();
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setStep({
      type: "totp-setup",
      secret: result.secret,
      qrCodeUrl: result.qrCodeUrl,
    });
  }

  async function handleVerifyTotp() {
    if (step.type !== "totp-setup") return;
    setLoading(true);
    setError("");
    const result = await enableTotp({ code, secret: step.secret });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setCode("");
    setStep({ type: "backup-codes", codes: result.backupCodes });
    loadStatus();
  }

  async function handleEnableEmail() {
    setLoading(true);
    setError("");
    const result = await enableEmailTwoFactor();
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setStep({ type: "backup-codes", codes: result.backupCodes });
    loadStatus();
  }

  async function handleDisable() {
    setLoading(true);
    setError("");
    const result = await disableTwoFactor(password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setPassword("");
    setStep({ type: "idle" });
    loadStatus();
  }

  async function handleRegenerate() {
    setLoading(true);
    setError("");
    const result = await regenerateBackupCodes(password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setPassword("");
    setStep({ type: "backup-codes", codes: result.backupCodes });
    loadStatus();
  }

  if (!status) return null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Status display */}
      {step.type === "idle" &&
        (status.method ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">
                2FA enabled via{" "}
                <span className="font-medium text-foreground">
                  {status.method === "totp" ? "authenticator app" : "email"}
                </span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {status.backupCodesRemaining} backup codes remaining
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep({ type: "regenerate" });
                  setError("");
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Regenerate backup codes
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep({ type: "disable" });
                  setError("");
                }}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep({ type: "choose" });
                setError("");
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Enable 2FA
            </button>
          </div>
        ))}

      {/* Method selection */}
      {step.type === "choose" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose a 2FA method:</p>
          <div className="grid gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleStartTotp}
              className="rounded-lg border border-border bg-card p-3 text-left hover:border-primary/50 hover:bg-accent"
            >
              <p className="text-sm font-medium text-foreground">
                Authenticator app
              </p>
              <p className="text-xs text-muted-foreground">
                Use an app like Google Authenticator or 1Password
              </p>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleEnableEmail}
              className="rounded-lg border border-border bg-card p-3 text-left hover:border-primary/50 hover:bg-accent"
            >
              <p className="text-sm font-medium text-foreground">Email codes</p>
              <p className="text-xs text-muted-foreground">
                Receive a code via email each time you sign in
              </p>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setStep({ type: "idle" })}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {/* TOTP setup */}
      {step.type === "totp-setup" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scan this QR code with your authenticator app, then enter the
            6-digit code to verify.
          </p>
          <div className="flex justify-center rounded-lg bg-white p-2">
            {/* biome-ignore lint/performance/noImgElement: data URL not supported by next/image */}
            <img
              src={step.qrCodeUrl}
              alt="TOTP QR Code"
              className="h-48 w-48"
            />
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Can&apos;t scan? Enter key manually
            </summary>
            <code className="mt-1 block break-all rounded bg-muted p-2 text-foreground select-all">
              {step.secret}
            </code>
          </details>
          <div className="space-y-2">
            <label
              htmlFor="totp-code"
              className="text-sm font-medium text-foreground"
            >
              Verification code
            </label>
            <input
              id="totp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClassName} text-center tracking-[0.3em] font-mono`}
              placeholder="000000"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || code.length !== 6}
              onClick={handleVerifyTotp}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & enable"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep({ type: "idle" });
                setCode("");
                setError("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backup codes display */}
      {step.type === "backup-codes" && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm p-3 rounded-md">
            Save these backup codes in a safe place. Each code can only be used
            once. You won&apos;t be able to see them again.
          </div>
          <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-3">
            {step.codes.map((c) => (
              <code key={c} className="text-sm font-mono text-foreground">
                {c}
              </code>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setStep({ type: "idle" });
              setError("");
            }}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            I&apos;ve saved my codes
          </button>
        </div>
      )}

      {/* Disable confirmation */}
      {step.type === "disable" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Enter your password to disable two-factor authentication.
          </p>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            placeholder="Your password"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || !password}
              onClick={handleDisable}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep({ type: "idle" });
                setPassword("");
                setError("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Regenerate backup codes */}
      {step.type === "regenerate" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Enter your password to regenerate backup codes. This will invalidate
            all existing codes.
          </p>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            placeholder="Your password"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || !password}
              onClick={handleRegenerate}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Regenerating..." : "Regenerate codes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep({ type: "idle" });
                setPassword("");
                setError("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
