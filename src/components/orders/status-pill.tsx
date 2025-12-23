import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_META, toneToBadgeVariant } from "@/constants/status";
import type { OrderStatus } from "@/lib/types-v2";

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];
  if (!meta) return null;
  return (
    <Badge variant={toneToBadgeVariant[meta.tone]} className={className}>
      {meta.label}
    </Badge>
  );
}
