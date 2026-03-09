"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ActionMenuItem {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  variant?: "destructive";
  hidden?: boolean;
}

export function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter((item) => !item.hidden);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (visibleItems.length === 0) return null;

  function toggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.right });
    }
    setOpen(!open);
  }

  async function handleClick(item: ActionMenuItem) {
    setOpen(false);
    if (item.onClick) {
      await item.onClick();
      router.refresh();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
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
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 w-44 rounded-md border border-border bg-popover py-1 shadow-md"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translateX(-100%)",
            }}
          >
            {visibleItems.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block px-3 py-2 text-sm hover:bg-muted ${item.variant === "destructive" ? "text-destructive" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleClick(item)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${item.variant === "destructive" ? "text-destructive" : ""}`}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
