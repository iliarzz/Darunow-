"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div>
        <p className="text-base font-bold text-text">{title}</p>
        {subtitle && <p className="text-xs text-muted line-clamp-2">{subtitle}</p>}
      </div>
      {action && (
        <Button asChild size="sm" variant="outline" onClick={action.onClick}>
          <a href={action.href}>{action.label}</a>
        </Button>
      )}
    </div>
  );
}
