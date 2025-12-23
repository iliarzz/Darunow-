"use client";

import { cn } from "@/lib/utils";

export function BrandSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-white/80 shadow-[0_10px_28px_rgba(12,34,78,0.06)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
