"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";
import { acceptTerms } from "@/actions/terms";
import { Logo } from "@/components/logo";
import { PrivacyContent } from "@/components/privacy-content";
import { TermsContent } from "@/components/terms-content";

export default function AcceptTermsPage() {
  const router = useRouter();
  const { update } = useSession();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || hasScrolledToBottom) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  async function handleAccept() {
    if (!accepted) return;
    setIsSubmitting(true);
    setError(null);

    const result = await acceptTerms();

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    // Refresh the JWT so middleware sees the updated termsAcceptedAt
    await update();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 dark:from-[#08071a] dark:via-[#100e28] dark:to-[#08071a] px-4 py-8">
      <div className="w-full max-w-lg space-y-6 rounded-2xl bg-card p-8 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Logo size={28} />
            <h1 className="text-2xl font-bold text-card-foreground">
              Clockwork
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Please review and accept our updated terms to continue
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[300px] overflow-y-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed text-muted-foreground scroll-smooth"
        >
          <TermsContent />
          <div className="my-4 border-t border-border" />
          <PrivacyContent />
        </div>

        {!hasScrolledToBottom && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            Scroll to the bottom to continue
          </p>
        )}

        <div className="flex items-start gap-2">
          <input
            id="acceptTerms"
            type="checkbox"
            disabled={!hasScrolledToBottom}
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-input accent-primary disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <label
            htmlFor="acceptTerms"
            className={`text-sm select-none ${hasScrolledToBottom ? "text-card-foreground" : "text-muted-foreground"}`}
          >
            I agree to the Terms &amp; Conditions and Privacy Policy
          </label>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          disabled={!accepted || isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Accepting..." : "Accept & Continue"}
        </button>
      </div>
    </div>
  );
}
