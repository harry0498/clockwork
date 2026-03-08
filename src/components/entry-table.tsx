"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { deleteEntry, toggleManuallyInvoiced } from "@/actions/entries";
import { type Column, DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { calculateAmount, formatGBP, formatMinutes } from "@/lib/tax-year";
import type { TimeEntryWithClient } from "@/lib/types";

type Entry = Pick<
  TimeEntryWithClient,
  | "id"
  | "title"
  | "minutes"
  | "ratePerHour"
  | "date"
  | "invoiceId"
  | "manuallyInvoiced"
  | "client"
>;

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
    const currentMenuId = openMenuId;

    function handleClickOutside(e: MouseEvent) {
      const trigger = triggerRefs.current.get(currentMenuId);
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
      <EmptyState
        message="No entries for this period."
        actionLabel="Log Time"
        actionHref="/entries/new"
      />
    );
  }

  const columns: Column<Entry>[] = [
    { header: "Date", accessor: "date" },
    { header: "Client", accessor: (e) => e.client.name },
    { header: "Title", accessor: "title", className: "font-medium" },
    {
      header: "Time",
      accessor: (e) => formatMinutes(e.minutes),
      align: "right",
    },
    {
      header: "Rate",
      accessor: (e) => `${formatGBP(e.ratePerHour)}/hr`,
      align: "right",
    },
    {
      header: "Amount",
      accessor: (e) => formatGBP(calculateAmount(e.minutes, e.ratePerHour)),
      align: "right",
      className: "font-medium",
    },
    {
      header: "Invoiced",
      align: "center",
      accessor: (e) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
            e.invoiceId || e.manuallyInvoiced
              ? "bg-green-100 text-green-800"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {e.invoiceId || e.manuallyInvoiced ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      accessor: (entry) =>
        !entry.invoiceId ? (
          <button
            type="button"
            ref={(el) => {
              if (el) triggerRefs.current.set(entry.id, el);
            }}
            onClick={() =>
              openMenuId === entry.id ? closeMenu() : openMenu(entry.id)
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
        ) : null,
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={entries} keyExtractor={(e) => e.id} />
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
                  Unmark as invoiced
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
    </>
  );
}
