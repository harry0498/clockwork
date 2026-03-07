"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { deleteEntry, toggleManuallyInvoiced } from "@/actions/entries";
import { formatGBP, formatMinutes } from "@/lib/tax-year";

interface Entry {
  id: string;
  title: string;
  minutes: number;
  ratePerHour: string;
  date: string;
  invoiceId: string | null;
  manuallyInvoiced: boolean;
  client: { id: string; name: string };
}

export function EntryTable({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const closeMenu = useCallback(() => setOpenMenuId(null), []);

  function openMenu(id: string) {
    const btn = triggerRefs.current.get(id);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right });
    }
    setOpenMenuId(id);
  }

  useEffect(() => {
    if (!openMenuId) return;

    function handleClickOutside(e: MouseEvent) {
      const trigger = triggerRefs.current.get(openMenuId);
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        trigger &&
        !trigger.contains(e.target as Node)
      ) {
        closeMenu();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId, closeMenu]);

  async function handleDelete(id: string) {
    setOpenMenuId(null);
    if (!confirm("Delete this entry?")) return;
    await deleteEntry(id);
    router.refresh();
  }

  async function handleToggleInvoiced(id: string) {
    setOpenMenuId(null);
    await toggleManuallyInvoiced(id);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">No entries for this period.</p>
        <Link
          href="/entries/new"
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Log Time
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Client</th>
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-right font-medium">Time</th>
            <th className="px-4 py-3 text-right font-medium">Rate</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-center font-medium">Invoiced</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const amount =
              (entry.minutes / 60) * Number.parseFloat(entry.ratePerHour);
            return (
              <tr
                key={entry.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">{entry.date}</td>
                <td className="px-4 py-3">{entry.client.name}</td>
                <td className="px-4 py-3 font-medium">{entry.title}</td>
                <td className="px-4 py-3 text-right">
                  {formatMinutes(entry.minutes)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatGBP(entry.ratePerHour)}/hr
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatGBP(amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      entry.invoiceId || entry.manuallyInvoiced
                        ? "bg-green-100 text-green-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {entry.invoiceId || entry.manuallyInvoiced ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {!entry.invoiceId && (
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) triggerRefs.current.set(entry.id, el);
                      }}
                      onClick={() =>
                        openMenuId === entry.id
                          ? closeMenu()
                          : openMenu(entry.id)
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        role="img"
                        aria-label="Actions"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {openMenuId &&
        (() => {
          const entry = entries.find((e) => e.id === openMenuId);
          if (!entry) return null;
          return createPortal(
            <div
              ref={menuRef}
              className="fixed z-50 w-44 rounded-md border border-border bg-popover py-1 shadow-md"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                transform: "translateX(-100%)",
              }}
            >
              {entry.manuallyInvoiced ? (
                <button
                  type="button"
                  onClick={() => handleToggleInvoiced(entry.id)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
                >
                  Mark as Uninvoiced
                </button>
              ) : (
                <>
                  <Link
                    href={`/entries/new?id=${entry.id}`}
                    className="block px-3 py-1.5 text-sm hover:bg-muted"
                    onClick={closeMenu}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleToggleInvoiced(entry.id)}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    Mark as Invoiced
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="w-full px-3 py-1.5 text-left text-sm text-destructive hover:bg-muted"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>,
            document.body,
          );
        })()}
    </div>
  );
}
