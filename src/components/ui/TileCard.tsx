"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function TileCard({
  title,
  subtitle,
  href,
  icon: Icon,
  className,
  onClick,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border border-border/70 bg-white p-4 shadow-none transition hover:border-brand/40",
        className,
      )}
      onClick={onClick}
    >
      <div className="space-y-1">
        <p className="text-sm font-bold text-text line-clamp-1">{title}</p>
        {subtitle && <p className="text-[11px] text-muted line-clamp-1">{subtitle}</p>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }
  return content;
}
