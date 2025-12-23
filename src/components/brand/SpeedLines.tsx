"use client";

import { cn } from "@/lib/utils";

export function SpeedLines({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-8 w-14 text-accent-200", className)}
      viewBox="0 0 80 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="6" width="40" height="4" rx="2" fill="currentColor" opacity="0.14" />
      <rect x="10" y="14" width="30" height="4" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="0" y="2" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
