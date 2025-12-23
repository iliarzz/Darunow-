"use client";

import { cn } from "@/lib/utils";

export function BrandPill({
  children,
  className,
  muted = false,
}: {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
        muted
          ? "border-border/70 bg-white/70 text-muted"
          : "border-brand/30 bg-brand/10 text-brand",
        className,
      )}
    >
      {children}
    </span>
  );
}
