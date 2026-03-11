"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function acceptTerms(): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await requireSession();
  const userId = session.user.id;

  await db
    .update(users)
    .set({ termsAcceptedAt: new Date() })
    .where(eq(users.id, userId));

  return { success: true };
}
