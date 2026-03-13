import Link from "next/link";
import { buttonClassName } from "@/lib/constants";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  message,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`mt-3 inline-block ${buttonClassName}`}
        >
          {actionLabel}
        </button>
      )}
      {actionLabel && actionHref && !onAction && (
        <Link
          href={actionHref}
          className={`mt-3 inline-block ${buttonClassName}`}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
