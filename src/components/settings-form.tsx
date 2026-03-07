"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/settings";

interface SettingsFormProps {
  profile: {
    name: string;
    email: string;
    addressLine1: string | null;
    addressLine2: string | null;
    county: string | null;
    postcode: string | null;
    mobile: string | null;
    bankName: string | null;
    accountNumber: string | null;
    sortCode: string | null;
  };
}

export function SettingsForm({ profile }: SettingsFormProps) {
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
      await updateProfile(formData);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={255}
            defaultValue={profile.name}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-sm">{profile.email}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="mobile" className="text-sm font-medium">
            Mobile
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            maxLength={20}
            defaultValue={profile.mobile ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Billing Address</h2>

        <div className="space-y-2">
          <label htmlFor="addressLine1" className="text-sm font-medium">
            Address Line 1
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            type="text"
            maxLength={255}
            defaultValue={profile.addressLine1 ?? ""}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="addressLine2" className="text-sm font-medium">
            Address Line 2
          </label>
          <input
            id="addressLine2"
            name="addressLine2"
            type="text"
            maxLength={255}
            defaultValue={profile.addressLine2 ?? ""}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="county" className="text-sm font-medium">
              County
            </label>
            <input
              id="county"
              name="county"
              type="text"
              maxLength={100}
              defaultValue={profile.county ?? ""}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="postcode" className="text-sm font-medium">
              Postcode
            </label>
            <input
              id="postcode"
              name="postcode"
              type="text"
              maxLength={20}
              defaultValue={profile.postcode ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Bank Details</h2>

        <div className="space-y-2">
          <label htmlFor="bankName" className="text-sm font-medium">
            Bank Name
          </label>
          <input
            id="bankName"
            name="bankName"
            type="text"
            maxLength={100}
            defaultValue={profile.bankName ?? ""}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium">
              Account Number
            </label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              maxLength={20}
              defaultValue={profile.accountNumber ?? ""}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sortCode" className="text-sm font-medium">
              Sort Code
            </label>
            <input
              id="sortCode"
              name="sortCode"
              type="text"
              maxLength={10}
              defaultValue={profile.sortCode ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
