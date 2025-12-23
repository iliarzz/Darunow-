import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SectionAction =
  | { label: string; href: string; variant?: "ghost" | "secondary" }
  | { label: string; onClick: () => void; variant?: "ghost" | "secondary" };

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: SectionAction;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="space-y-1">
        <h2 className="type-h2 text-primary-900">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Button
          size="sm"
          variant={action.variant ?? "ghost"}
          className="rounded-full px-3 text-sm"
          onClick={"onClick" in action ? action.onClick : undefined}
          asChild={"href" in action}
        >
          {"href" in action ? <Link href={action.href}>{action.label}</Link> : <span>{action.label}</span>}
        </Button>
      )}
    </div>
  );
}
