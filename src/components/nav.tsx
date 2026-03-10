"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

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

function NavLinks({
  onboardingStatus,
  onNavigate,
}: {
  onboardingStatus: OnboardingStatus;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const onboardingComplete =
    onboardingStatus.hasClients &&
    onboardingStatus.hasEntries &&
    onboardingStatus.hasInvoices;
  const nextStep = getNextStep(onboardingStatus);

  return (
    <>
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
              onClick={onNavigate}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-muted text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-white"
              }`}
            >
              {showStep && (
                <span className="text-xs text-sidebar-foreground/50">
                  {link.step}
                </span>
              )}
              {link.label}
              {isNextStep && !isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-foreground" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-muted p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            onClick={onNavigate}
            className={`block text-sm ${
              pathname === "/settings"
                ? "font-medium text-white"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
            }`}
          >
            Settings
          </Link>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export function Nav({
  onboardingStatus,
}: {
  onboardingStatus: OnboardingStatus;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center bg-sidebar px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/"
          className="ml-3 flex items-center gap-2 text-lg font-bold text-white"
        >
          <Logo />
          Clockwork
        </Link>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-lg">
            <div className="flex items-center justify-between p-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-bold text-white"
                onClick={() => setDrawerOpen(false)}
              >
                <Logo />
                Clockwork
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks
              onboardingStatus={onboardingStatus}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-56 flex-col bg-sidebar text-sidebar-foreground">
        <div className="p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-white"
          >
            <Logo />
            Clockwork
          </Link>
        </div>
        <NavLinks onboardingStatus={onboardingStatus} />
      </aside>
    </>
  );
}
