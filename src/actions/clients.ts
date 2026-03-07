"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients, timeEntries } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { clientSchema } from "@/lib/validators";

export async function getClients() {
  const session = await requireSession();
  return db.query.clients.findMany({
    where: eq(clients.userId, session.user.id),
    orderBy: (clients, { asc }) => [asc(clients.name)],
  });
}

export async function getClientsWithStats() {
  const session = await requireSession();

  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      totalEarned: sql<number>`coalesce(sum(${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0), 0)`,
      unbilledAmount: sql<number>`coalesce(sum(case when ${timeEntries.invoiceId} is null and ${timeEntries.manuallyInvoiced} = false then ${timeEntries.minutes} * ${timeEntries.ratePerHour} / 60.0 else 0 end), 0)`,
    })
    .from(clients)
    .leftJoin(timeEntries, eq(clients.id, timeEntries.clientId))
    .where(eq(clients.userId, session.user.id))
    .groupBy(clients.id, clients.name, clients.email)
    .orderBy(clients.name);

  return rows.map((row) => ({
    ...row,
    totalMinutes: Number(row.totalMinutes),
    totalEarned: Number(row.totalEarned),
    unbilledAmount: Number(row.unbilledAmount),
  }));
}

export async function getClient(id: string) {
  const session = await requireSession();
  return db.query.clients.findFirst({
    where: and(eq(clients.id, id), eq(clients.userId, session.user.id)),
  });
}

export async function createClient(formData: FormData) {
  const session = await requireSession();

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    addressLine1: formData.get("addressLine1") as string,
    addressLine2: formData.get("addressLine2") as string,
    county: formData.get("county") as string,
    postcode: formData.get("postcode") as string,
    vatNumber: formData.get("vatNumber") as string,
  };

  const data = clientSchema.parse(raw);

  await db.insert(clients).values({
    userId: session.user.id,
    name: data.name,
    email: data.email || null,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2 || null,
    county: data.county,
    postcode: data.postcode,
    vatNumber: data.vatNumber || null,
  });

  revalidatePath("/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const session = await requireSession();

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    addressLine1: formData.get("addressLine1") as string,
    addressLine2: formData.get("addressLine2") as string,
    county: formData.get("county") as string,
    postcode: formData.get("postcode") as string,
    vatNumber: formData.get("vatNumber") as string,
  };

  const data = clientSchema.parse(raw);

  await db
    .update(clients)
    .set({
      name: data.name,
      email: data.email || null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      county: data.county,
      postcode: data.postcode,
      vatNumber: data.vatNumber || null,
    })
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)));

  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  const session = await requireSession();

  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, session.user.id)));

  revalidatePath("/clients");
}
