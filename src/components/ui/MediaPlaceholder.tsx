"use client";

import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

type MediaPlaceholderProps = {
  aspect?: "banner" | "square" | "wide";
  className?: string;
  children?: React.ReactNode;
};

const aspectMap = {
  banner: "aspect-[3.4/1]",
  square: "aspect-square",
  wide: "aspect-[4/3]",
};

export function MediaPlaceholder({ aspect = "wide", className, children }: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-border bg-surface-2",
        aspectMap[aspect as keyof typeof aspectMap],
        className,
      )}
    >
      <SpeedLinesWash />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 text-primary-800">
        <ImageOff className="h-5 w-5 text-accent-400" />
        <p className="text-sm font-semibold text-primary-900">تصویر به‌زودی</p>
        {children ? <div className="text-xs text-muted">{children}</div> : null}
      </div>
    </div>
  );
}

function SpeedLinesWash() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-accent-200/25 via-surface-2 to-surface-2">
      <div className="absolute -left-6 top-6 h-1 w-28 rounded-full bg-accent-200/50" />
      <div className="absolute -left-3 top-12 h-1 w-20 rounded-full bg-accent-200/40" />
      <div className="absolute -left-1 top-16 h-1 w-14 rounded-full bg-accent-200/30" />
    </div>
  );
}
