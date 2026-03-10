import { compare } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { generateCode, generateToken, hashToken } from "./crypto";
import { sendTwoFactorCode } from "./email";
import { checkRateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorBypassToken: { label: "2FA Bypass", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const { allowed } = checkRateLimit(credentials.email);
        if (!allowed) {
          throw new Error("Too many login attempts. Try again later.");
        }

        // Handle 2FA bypass token (second step of 2FA flow)
        if (credentials.twoFactorBypassToken) {
          const bypassRecord = await db.query.verificationTokens.findFirst({
            where: and(
              eq(
                verificationTokens.tokenHash,
                hashToken(credentials.twoFactorBypassToken),
              ),
              eq(verificationTokens.type, "2fa_bypass"),
              gt(verificationTokens.expiresAt, new Date()),
            ),
          });

          if (!bypassRecord) {
            return null;
          }

          // Delete used bypass token
          await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.id, bypassRecord.id));

          const user = await db.query.users.findFirst({
            where: eq(users.id, bypassRecord.userId),
          });

          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        // Normal password flow
        if (!credentials.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Check if 2FA is enabled
        if (user.twoFactorMethod) {
          // Clean up old pending tokens for this user
          await db
            .delete(verificationTokens)
            .where(
              and(
                eq(verificationTokens.userId, user.id),
                eq(verificationTokens.type, "pending_2fa"),
              ),
            );

          // Create pending 2FA token
          const pendingToken = generateToken();
          await db.insert(verificationTokens).values({
            userId: user.id,
            type: "pending_2fa",
            tokenHash: hashToken(pendingToken),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          });

          // If email 2FA, send the code
          if (user.twoFactorMethod === "email") {
            const code = generateCode();
            await db.insert(verificationTokens).values({
              userId: user.id,
              type: "email_2fa",
              tokenHash: hashToken(code),
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            });
            await sendTwoFactorCode(user.email, code);
          }

          // Throw error with pending token — login page will parse this
          throw new Error(
            `2FA_REQUIRED:${pendingToken}|${user.twoFactorMethod}`,
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
