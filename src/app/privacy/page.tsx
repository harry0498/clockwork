import Link from "next/link";
import { Logo } from "@/components/logo";
import { PrivacyContent } from "@/components/privacy-content";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 dark:from-[#08071a] dark:via-[#100e28] dark:to-[#08071a] px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-card p-6 shadow-2xl sm:p-10">
        <div className="mb-6 flex items-center gap-2">
          <Logo size={24} />
          <Link href="/" className="text-lg font-bold text-card-foreground">
            Clockwork
          </Link>
        </div>
        <PrivacyContent />
        <div className="mt-8 border-t border-border pt-4">
          <Link
            href="/terms"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
