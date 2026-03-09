"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateProfile } from "@/actions/settings";
import { inputClassName } from "@/lib/constants";
import type { User } from "@/lib/types";
import { type UserProfileInput, userProfileSchema } from "@/lib/validators";

interface SettingsFormProps {
  profile: Pick<
    User,
    | "name"
    | "email"
    | "addressLine1"
    | "addressLine2"
    | "county"
    | "postcode"
    | "mobile"
    | "bankName"
    | "accountNumber"
    | "sortCode"
  >;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: profile.name,
      addressLine1: profile.addressLine1 ?? "",
      addressLine2: profile.addressLine2 ?? "",
      county: profile.county ?? "",
      postcode: profile.postcode ?? "",
      mobile: profile.mobile ?? "",
      bankName: profile.bankName ?? "",
      accountNumber: profile.accountNumber ?? "",
      sortCode: profile.sortCode ?? "",
    },
  });

  async function onSubmit(data: UserProfileInput) {
    try {
      await updateProfile(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name *
          </label>
          <input
            id="name"
            type="text"
            maxLength={255}
            {...register("name")}
            className={inputClassName}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
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
            type="tel"
            maxLength={20}
            {...register("mobile")}
            className={inputClassName}
          />
          {errors.mobile && (
            <p className="text-sm text-destructive">{errors.mobile.message}</p>
          )}
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
            type="text"
            maxLength={255}
            {...register("addressLine1")}
            className={inputClassName}
          />
          {errors.addressLine1 && (
            <p className="text-sm text-destructive">
              {errors.addressLine1.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="addressLine2" className="text-sm font-medium">
            Address Line 2
          </label>
          <input
            id="addressLine2"
            type="text"
            maxLength={255}
            {...register("addressLine2")}
            className={inputClassName}
          />
          {errors.addressLine2 && (
            <p className="text-sm text-destructive">
              {errors.addressLine2.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="county" className="text-sm font-medium">
              County
            </label>
            <input
              id="county"
              type="text"
              maxLength={100}
              {...register("county")}
              className={inputClassName}
            />
            {errors.county && (
              <p className="text-sm text-destructive">
                {errors.county.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="postcode" className="text-sm font-medium">
              Postcode
            </label>
            <input
              id="postcode"
              type="text"
              maxLength={20}
              {...register("postcode")}
              className={inputClassName}
            />
            {errors.postcode && (
              <p className="text-sm text-destructive">
                {errors.postcode.message}
              </p>
            )}
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
            type="text"
            maxLength={100}
            {...register("bankName")}
            className={inputClassName}
          />
          {errors.bankName && (
            <p className="text-sm text-destructive">
              {errors.bankName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="accountNumber" className="text-sm font-medium">
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              maxLength={20}
              {...register("accountNumber")}
              className={inputClassName}
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="sortCode" className="text-sm font-medium">
              Sort Code
            </label>
            <input
              id="sortCode"
              type="text"
              maxLength={10}
              {...register("sortCode")}
              className={inputClassName}
            />
            {errors.sortCode && (
              <p className="text-sm text-destructive">
                {errors.sortCode.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
