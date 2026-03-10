"use server";

import { hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { generateToken, hashToken } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
  type ResetPasswordInput,
  resetPasswordSchema,
  type SignupInput,
  signupSchema,
  type VerifyTwoFactorInput,
  verifyTwoFactorSchema,
} from "@/lib/validators";

export async function signup(
  data: SignupInput,
): Promise<{ success: true } | { success: false; error: string }> {
  const { allowed } = checkRateLimit(`signup:${data.email}`);
  if (!allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  try {
    await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    });
  } catch {
    // Silently ignore duplicate email to prevent enumeration
  }

  // Always return success to prevent email enumeration
  return { success: true };
}

type ActionResult = { success: true } | { success: false; error: string };

export async function requestPasswordReset(
  data: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { allowed } = checkRateLimit(`reset:${parsed.data.email}`);
  if (!allowed) {
    // Always return success to prevent email enumeration
    return { success: true };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
    columns: { id: true },
  });

  if (user) {
    // Clean up old tokens for this user
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, user.id),
          eq(verificationTokens.type, "password_reset"),
        ),
      );

    const token = generateToken();
    await db.insert(verificationTokens).values({
      userId: user.id,
      type: "password_reset",
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await sendPasswordResetEmail(parsed.data.email, token);
  }

  // Always return success to prevent email enumeration
  return { success: true };
}

export async function resetPassword(
  data: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const tokenRecord = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.tokenHash, hashToken(parsed.data.token)),
      eq(verificationTokens.type, "password_reset"),
      gt(verificationTokens.expiresAt, new Date()),
    ),
  });

  if (!tokenRecord) {
    return {
      success: false,
      error: "Invalid or expired reset link. Please request a new one.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, tokenRecord.userId));

  // Delete the used token
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, tokenRecord.id));

  return { success: true };
}

export async function verifyTwoFactor(
  data: VerifyTwoFactorInput,
): Promise<
  { success: true; bypassToken: string } | { success: false; error: string }
> {
  const parsed = verifyTwoFactorSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { allowed } = checkRateLimit(`2fa:${parsed.data.pendingToken}`);
  if (!allowed) {
    return { success: false, error: "Too many attempts. Try again later." };
  }

  // Find pending 2FA token
  const pendingRecord = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.tokenHash, hashToken(parsed.data.pendingToken)),
      eq(verificationTokens.type, "pending_2fa"),
      gt(verificationTokens.expiresAt, new Date()),
    ),
  });

  if (!pendingRecord) {
    return { success: false, error: "Session expired. Please log in again." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, pendingRecord.userId),
    columns: {
      id: true,
      twoFactorMethod: true,
      totpSecret: true,
      backupCodes: true,
    },
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  let valid = false;

  if (parsed.data.isBackupCode) {
    // Validate backup code
    if (!user.backupCodes) {
      return { success: false, error: "No backup codes configured." };
    }
    const hashed = hashToken(parsed.data.code);
    const codes: string[] = JSON.parse(user.backupCodes);
    const codeIndex = codes.indexOf(hashed);
    if (codeIndex >= 0) {
      valid = true;
      // Remove used backup code
      codes.splice(codeIndex, 1);
      await db
        .update(users)
        .set({ backupCodes: JSON.stringify(codes) })
        .where(eq(users.id, user.id));
    }
  } else if (user.twoFactorMethod === "totp") {
    // Validate TOTP code
    const { verifySync } = await import("otplib");
    const { decrypt } = await import("@/lib/crypto");
    if (!user.totpSecret) {
      return { success: false, error: "TOTP not configured." };
    }
    const secret = decrypt(user.totpSecret);
    const result = verifySync({ token: parsed.data.code, secret });
    valid = result.valid;
  } else if (user.twoFactorMethod === "email") {
    // Validate email code
    const emailRecord = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.userId, user.id),
        eq(verificationTokens.type, "email_2fa"),
        eq(verificationTokens.tokenHash, hashToken(parsed.data.code)),
        gt(verificationTokens.expiresAt, new Date()),
      ),
    });
    if (emailRecord) {
      valid = true;
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.id, emailRecord.id));
    }
  }

  if (!valid) {
    return { success: false, error: "Invalid code. Please try again." };
  }

  // Delete pending token
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, pendingRecord.id));

  // Create short-lived bypass token
  const bypassToken = generateToken();
  await db.insert(verificationTokens).values({
    userId: user.id,
    type: "2fa_bypass",
    tokenHash: hashToken(bypassToken),
    expiresAt: new Date(Date.now() + 30 * 1000), // 30 seconds
  });

  return { success: true, bypassToken };
}
