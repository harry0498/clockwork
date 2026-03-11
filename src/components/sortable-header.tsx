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

  const arrow = isActive ? (currentDir === "asc" ? " \u2191" : " \u2193") : "";

  return (
    <Link
      href={`${pathname}?${params.toString()}`}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      {arrow && <span className="text-xs text-foreground">{arrow}</span>}
    </Link>
  );
}
