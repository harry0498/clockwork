"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface OnboardingStatus {
  hasClients: boolean;
  hasEntries: boolean;
  hasInvoices: boolean;
}

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients", step: 1 },
  { href: "/entries", label: "Entries", step: 2 },
  { href: "/invoices", label: "Invoices", step: 3 },
] as const;

function getNextStep(status: OnboardingStatus): number {
  if (!status.hasClients) return 1;
  if (!status.hasEntries) return 2;
  if (!status.hasInvoices) return 3;
  return 0;
}

export function Nav({
  onboardingStatus,
}: {
  onboardingStatus: OnboardingStatus;
}) {
  const pathname = usePathname();
  const onboardingComplete =
    onboardingStatus.hasClients &&
    onboardingStatus.hasEntries &&
    onboardingStatus.hasInvoices;
  const nextStep = getNextStep(onboardingStatus);

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-muted/50">
      <div className="p-4">
        <Link href="/" className="text-lg font-bold">
          Clockwork
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          const showStep = !onboardingComplete && "step" in link;
          const isNextStep = showStep && link.step === nextStep;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {showStep && (
                <span className="text-xs text-muted-foreground">
                  {link.step}
                </span>
              )}
              {link.label}
              {isNextStep && !isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-2">
        <Link
          href="/settings"
          className={`block text-sm ${
            pathname === "/settings"
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Settings
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
