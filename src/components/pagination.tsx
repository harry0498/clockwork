"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function buildHref(
  pathname: string,
  searchParams: URLSearchParams,
  page: number,
) {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

type PageItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({
      type: "page" as const,
      page: i + 1,
    }));
  }

  const items: PageItem[] = [{ type: "page", page: 1 }];

  if (current > 3) items.push({ type: "ellipsis", key: "start" });

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) items.push({ type: "page", page: i });

  if (current < total - 2) items.push({ type: "ellipsis", key: "end" });

  items.push({ type: "page", page: total });
  return items;
}

export function Pagination({
  currentPage,
  pageCount,
}: {
  currentPage: number;
  pageCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < pageCount;
  const items = getPageItems(currentPage, pageCount);

  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-input px-3 text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50";
  const activeClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-sm text-primary-foreground shadow-sm";

  return (
    <nav className="flex items-center justify-center gap-1 pt-4">
      {/* Mobile: prev/next + label */}
      <div className="flex items-center gap-2 md:hidden">
        {hasPrev ? (
          <Link
            href={buildHref(pathname, searchParams, currentPage - 1)}
            className={linkClass}
          >
            Prev
          </Link>
        ) : (
          <span className={`${linkClass} pointer-events-none opacity-50`}>
            Prev
          </span>
        )}
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {pageCount}
        </span>
        {hasNext ? (
          <Link
            href={buildHref(pathname, searchParams, currentPage + 1)}
            className={linkClass}
          >
            Next
          </Link>
        ) : (
          <span className={`${linkClass} pointer-events-none opacity-50`}>
            Next
          </span>
        )}
      </div>

      {/* Desktop: page numbers */}
      <div className="hidden items-center gap-1 md:flex">
        {hasPrev && (
          <Link
            href={buildHref(pathname, searchParams, currentPage - 1)}
            className={linkClass}
          >
            Prev
          </Link>
        )}
        {items.map((item) =>
          item.type === "ellipsis" ? (
            <span
              key={item.key}
              className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : item.page === currentPage ? (
            <span key={item.page} className={activeClass}>
              {item.page}
            </span>
          ) : (
            <Link
              key={item.page}
              href={buildHref(pathname, searchParams, item.page)}
              className={linkClass}
            >
              {item.page}
            </Link>
          ),
        )}
        {hasNext && (
          <Link
            href={buildHref(pathname, searchParams, currentPage + 1)}
            className={linkClass}
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
