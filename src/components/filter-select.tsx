"use client";

import { useId } from "react";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  isFiltered?: boolean;
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  isFiltered,
  className,
}: FilterSelectProps) {
  const id = useId();

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`mb-1 block text-[11px] font-medium uppercase tracking-wider ${
          isFiltered ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {isFiltered && (
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
        )}
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-border bg-card px-3 pr-8 text-sm font-medium shadow-sm outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
