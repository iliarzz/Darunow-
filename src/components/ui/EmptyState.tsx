"use client";

import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateAction =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-[16px] border border-border bg-surface-1 p-5 shadow-xs", className)}>
      <div className="flex items-center gap-2 text-primary-800">
        {icon ?? <Inbox className="h-5 w-5 text-accent-500" />}
        <h3 className="text-[15px] font-semibold">{title}</h3>
      </div>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && (
        <Button
          variant="primary"
          size="sm"
          asChild
          onClick={"onClick" in action ? action.onClick : undefined}
          className="mt-1 w-fit"
        >
          {"href" in action ? <a href={action.href}>{action.label}</a> : <span>{action.label}</span>}
        </Button>
      )}
    </div>
  );
}
