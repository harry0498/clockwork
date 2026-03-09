"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClient, updateClient } from "@/actions/clients";
import { inputClassName } from "@/lib/constants";
import type { Client } from "@/lib/types";
import { type ClientInput, clientSchema } from "@/lib/validators";

export interface ClientFormProps {
  client?: Pick<
    Client,
    | "id"
    | "name"
    | "email"
    | "addressLine1"
    | "addressLine2"
    | "county"
    | "postcode"
    | "vatNumber"
  >;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      addressLine1: client?.addressLine1 ?? "",
      addressLine2: client?.addressLine2 ?? "",
      county: client?.county ?? "",
      postcode: client?.postcode ?? "",
      vatNumber: client?.vatNumber ?? "",
    },
  });

  async function onSubmit(data: ClientInput) {
    try {
      if (isEditing) {
        await updateClient(client.id, data);
      } else {
        await createClient(data);
      }
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(isEditing ? `/clients/${client.id}` : "/clients");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          type="text"
          maxLength={200}
          {...register("name")}
          className={inputClassName}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={inputClassName}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="addressLine1" className="text-sm font-medium">
          Address Line 1 *
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
            County *
          </label>
          <input
            id="county"
            type="text"
            maxLength={100}
            {...register("county")}
            className={inputClassName}
          />
          {errors.county && (
            <p className="text-sm text-destructive">{errors.county.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="postcode" className="text-sm font-medium">
            Postcode *
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

      <div className="space-y-2">
        <label htmlFor="vatNumber" className="text-sm font-medium">
          VAT Number
        </label>
        <input
          id="vatNumber"
          type="text"
          maxLength={50}
          {...register("vatNumber")}
          className={inputClassName}
        />
        {errors.vatNumber && (
          <p className="text-sm text-destructive">{errors.vatNumber.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Client"
              : "Create Client"}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
