import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

function getFrom(): string {
  return process.env.EMAIL_FROM ?? "Clockwork <noreply@clockwork.app>";
}

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<void> {
  const resend = getResend();
  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: "Reset your password",
    html: `
			<h2>Reset your password</h2>
			<p>Click the link below to reset your password. This link expires in 1 hour.</p>
			<p><a href="${resetUrl}">Reset password</a></p>
			<p>If you didn't request this, you can safely ignore this email.</p>
		`,
  });
}

export async function sendTwoFactorCode(
  to: string,
  code: string,
): Promise<void> {
  const resend = getResend();

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: "Your login code",
    html: `
			<h2>Your login code</h2>
			<p>Enter this code to complete your sign-in:</p>
			<p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: monospace;">${code}</p>
			<p>This code expires in 5 minutes.</p>
			<p>If you didn't try to sign in, please change your password immediately.</p>
		`,
  });
}
