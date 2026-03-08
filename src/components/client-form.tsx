"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient, updateClient } from "@/actions/clients";
import { Alert } from "@/components/alert";
import { inputClassName } from "@/lib/constants";
import type { Client } from "@/lib/types";

interface ClientFormProps {
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
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!client;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (isEditing) {
        await updateClient(client.id, formData);
      } else {
        await createClient(formData);
      }
      router.push("/clients");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && <Alert message={error} variant="error" />}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={200}
          defaultValue={client?.name ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={client?.email ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="addressLine1" className="text-sm font-medium">
          Address Line 1 *
        </label>
        <input
          id="addressLine1"
          name="addressLine1"
          type="text"
          required
          maxLength={255}
          defaultValue={client?.addressLine1 ?? ""}
          className={inputClassName}
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
          defaultValue={client?.addressLine2 ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="county" className="text-sm font-medium">
            County *
          </label>
          <input
            id="county"
            name="county"
            type="text"
            required
            maxLength={100}
            defaultValue={client?.county ?? ""}
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="postcode" className="text-sm font-medium">
            Postcode *
          </label>
          <input
            id="postcode"
            name="postcode"
            type="text"
            required
            maxLength={20}
            defaultValue={client?.postcode ?? ""}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="vatNumber" className="text-sm font-medium">
          VAT Number
        </label>
        <input
          id="vatNumber"
          name="vatNumber"
          type="text"
          maxLength={50}
          defaultValue={client?.vatNumber ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Client"
              : "Create Client"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
