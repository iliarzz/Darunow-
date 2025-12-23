"use client";

import { SpeedLines } from "@/components/brand/SpeedLines";
import { cn } from "@/lib/utils";

export function SpeedLineAccent({ className }: { className?: string }) {
  return <SpeedLines className={cn("h-6 w-12 text-accent-200/80", className)} />;
}
