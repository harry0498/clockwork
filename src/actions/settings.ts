"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireSession } from "@/lib/session";
import {
  type ChangePasswordInput,
  changePasswordSchema,
  type UserProfileInput,
  userProfileSchema,
} from "@/lib/validators";

export async function getProfile() {
  const session = await requireSession();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      name: true,
      email: true,
      addressLine1: true,
      addressLine2: true,
      county: true,
      postcode: true,
      mobile: true,
      bankName: true,
      accountNumber: true,
      sortCode: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateProfile(input: UserProfileInput) {
  const session = await requireSession();

  const data = userProfileSchema.parse(input);

  await db
    .update(users)
    .set({
      name: data.name,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      county: data.county || null,
      postcode: data.postcode || null,
      mobile: data.mobile || null,
      bankName: data.bankName || null,
      accountNumber: data.accountNumber || null,
      sortCode: data.sortCode || null,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
}

export async function changePassword(input: ChangePasswordInput) {
  const session = await requireSession();

  const data = changePasswordSchema.parse(input);

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { passwordHash: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await compare(data.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const newHash = await hash(data.newPassword, 12);

  await db
    .update(users)
    .set({ passwordHash: newHash })
    .where(eq(users.id, session.user.id));
}
