"use client";

import { useRef, useState } from "react";
import { changePassword } from "@/actions/settings";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await changePassword(formData);
      setSuccess("Password changed successfully");
      formRef.current?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Current Password *
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New Password *
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
