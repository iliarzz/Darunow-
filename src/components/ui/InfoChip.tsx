"use client";

import { cn } from "@/lib/utils";

export function InfoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-primary-800 shadow-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}
