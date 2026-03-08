"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { changePassword } from "@/actions/settings";
import { Alert } from "@/components/alert";
import { inputClassName } from "@/lib/constants";
import {
  type ChangePasswordInput,
  changePasswordSchema,
} from "@/lib/validators";

export function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordInput) {
    setError("");
    setSuccess("");
    try {
      await changePassword(data);
      setSuccess("Password changed successfully");
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert message={error} variant="error" />}
      {success && <Alert message={success} variant="success" />}

      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Current Password *
        </label>
        <input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          className={inputClassName}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New Password *
        </label>
        <input
          id="newPassword"
          type="password"
          {...register("newPassword")}
          className={inputClassName}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          type="password"
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
