import Link from "next/link";

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
    <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
      {actionLabel && actionHref && !onAction && (
        <Link
          href={actionHref}
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
