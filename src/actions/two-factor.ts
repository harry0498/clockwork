"use server";

import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { generateSecret, generateURI, verifySync } from "otplib";
import { toDataURL } from "qrcode";
import { db } from "@/db";
import { users } from "@/db/schema";
import { encrypt, generateBackupCodes } from "@/lib/crypto";
import { requireSession } from "@/lib/session";
import type { ActionResult } from "@/lib/types";
import { type TotpSetupInput, totpSetupSchema } from "@/lib/validators";

async function requirePasswordConfirmation(
  password: string,
): Promise<
  { success: true; userId: string } | { success: false; error: string }
> {
  const session = await requireSession();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { passwordHash: true, twoFactorMethod: true },
  });

  if (!user) return { success: false, error: "User not found" };
  if (!user.twoFactorMethod) {
    return { success: false, error: "2FA is not enabled." };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Incorrect password." };
  }

  return { success: true, userId: session.user.id };
}

export async function generateTotpSetup(): Promise<
  | { success: true; secret: string; qrCodeUrl: string; otpauthUrl: string }
  | { success: false; error: string }
> {
  const session = await requireSession();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { email: true, twoFactorMethod: true },
  });

  if (!user) return { success: false, error: "User not found" };
  if (user.twoFactorMethod) {
    return {
      success: false,
      error: "2FA is already enabled. Disable it first.",
    };
  }

  const secret = generateSecret();
  const otpauthUrl = generateURI({
    secret,
    issuer: "Clockwork",
    label: user.email,
  });
  const qrCodeUrl = await toDataURL(otpauthUrl);

  return { success: true, secret, qrCodeUrl, otpauthUrl };
}

export async function enableTotp(
  data: TotpSetupInput,
): Promise<
  { success: true; backupCodes: string[] } | { success: false; error: string }
> {
  const session = await requireSession();
  const parsed = totpSetupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Verify the code against the secret
  const result = verifySync({
    token: parsed.data.code,
    secret: parsed.data.secret,
  });
  const valid = result.valid;

  if (!valid) {
    return {
      success: false,
      error: "Invalid code. Make sure your authenticator app is synced.",
    };
  }

  const { raw, hashed } = generateBackupCodes();

  await db
    .update(users)
    .set({
      twoFactorMethod: "totp",
      totpSecret: encrypt(parsed.data.secret),
      backupCodes: JSON.stringify(hashed),
    })
    .where(eq(users.id, session.user.id));

  return { success: true, backupCodes: raw };
}

export async function enableEmailTwoFactor(): Promise<
  { success: true; backupCodes: string[] } | { success: false; error: string }
> {
  const session = await requireSession();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { twoFactorMethod: true },
  });

  if (!user) return { success: false, error: "User not found" };
  if (user.twoFactorMethod) {
    return {
      success: false,
      error: "2FA is already enabled. Disable it first.",
    };
  }

  const { raw, hashed } = generateBackupCodes();

  await db
    .update(users)
    .set({
      twoFactorMethod: "email",
      totpSecret: null,
      backupCodes: JSON.stringify(hashed),
    })
    .where(eq(users.id, session.user.id));

  return { success: true, backupCodes: raw };
}

export async function disableTwoFactor(
  password: string,
): Promise<ActionResult> {
  const result = await requirePasswordConfirmation(password);
  if (!result.success) return result;

  await db
    .update(users)
    .set({
      twoFactorMethod: null,
      totpSecret: null,
      backupCodes: null,
    })
    .where(eq(users.id, result.userId));

  return { success: true };
}

export async function regenerateBackupCodes(
  password: string,
): Promise<
  { success: true; backupCodes: string[] } | { success: false; error: string }
> {
  const result = await requirePasswordConfirmation(password);
  if (!result.success) return result;

  const { raw, hashed } = generateBackupCodes();

  await db
    .update(users)
    .set({ backupCodes: JSON.stringify(hashed) })
    .where(eq(users.id, result.userId));

  return { success: true, backupCodes: raw };
}

export async function getTwoFactorStatus(): Promise<{
  method: string | null;
  backupCodesRemaining: number;
}> {
  const session = await requireSession();

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { twoFactorMethod: true, backupCodes: true },
  });

  if (!user) throw new Error("User not found");

  let backupCodesRemaining = 0;
  if (user.backupCodes) {
    try {
      const codes: string[] = JSON.parse(user.backupCodes);
      backupCodesRemaining = codes.length;
    } catch {
      // Corrupted backup codes — treat as zero remaining
    }
  }

  return { method: user.twoFactorMethod, backupCodesRemaining };
}
