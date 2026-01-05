"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

type Option<T extends string> = {
  label: string;
  value: T;
  badge?: string | number;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
};

const itemStyles = cva(
  "flex-1 rounded-full border px-3 py-2 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1",
  {
    variants: {
      active: {
        true: "border-primary-700 bg-accent-200/70 text-primary-900 shadow-xs",
        false: "border-divider bg-surface-1 text-muted hover:border-primary-700/30",
      },
    },
  },
);

export function SegmentedControl<T extends string>({ options, value, onChange, className }: Props<T>) {
  return (
    <div className={cn("flex items-center gap-2 rounded-full border border-border bg-surface-2 p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={itemStyles({ active })}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="line-clamp-1">{opt.label}</span>
              {opt.badge !== undefined && (
                <span className="rounded-full bg-surface-3 px-2 py-[2px] text-[11px] text-muted">{opt.badge}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
