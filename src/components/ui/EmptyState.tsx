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
    <div className={cn("flex flex-col gap-3 rounded-[16px] border border-divider bg-surface-1 p-5 shadow-elev-1", className)}>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-accent-200/35 text-primary-800">
          {icon ?? <Inbox className="h-5 w-5" />}
        </div>
        <div className="space-y-1">
          <h3 className="text-[15px] font-semibold text-primary-900">{title}</h3>
          {description && <p className="text-sm text-muted leading-relaxed">{description}</p>}
        </div>
      </div>
      {action && (
        <Button
          variant="secondary"
          size="md"
          asChild
          onClick={"onClick" in action ? action.onClick : undefined}
          className="w-fit rounded-full px-4"
        >
          {"href" in action ? <a href={action.href}>{action.label}</a> : <span>{action.label}</span>}
        </Button>
      )}
    </div>
  );
}
