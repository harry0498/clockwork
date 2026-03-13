import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { TermsContent } from "@/components/terms-content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read Clockwork's terms and conditions for using our time tracking and invoicing platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 dark:from-[#08071a] dark:via-[#100e28] dark:to-[#08071a] px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-card p-6 shadow-2xl sm:p-10">
        <div className="mb-6 flex items-center gap-2">
          <Logo size={24} />
          <Link href="/" className="text-lg font-bold text-card-foreground">
            Clockwork
          </Link>
        </div>
        <TermsContent />
        <div className="mt-8 border-t border-border pt-4">
          <Link
            href="/privacy"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
