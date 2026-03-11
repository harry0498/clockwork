"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
}: {
  label: string;
  sortKey: string;
  currentSort: string | null;
  currentDir: "asc" | "desc" | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = currentSort === sortKey;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams(searchParams.toString());
  params.set("sort", sortKey);
  params.set("dir", nextDir);
  params.delete("page");

  return (
    <Link
      href={`${pathname}?${params.toString()}`}
      className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      {isActive && (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          {currentDir === "asc" ? (
            <path d="m18 15-6-6-6 6" />
          ) : (
            <path d="m6 9 6 6 6-6" />
          )}
        </svg>
      )}
    </Link>
  );
}
