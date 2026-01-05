import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_META, toneToBadgeVariant, type AnyOrderStatus } from "@/constants/status";

export function StatusPill({ status, className }: { status: AnyOrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];
  if (!meta) {
    return (
      <Badge variant="neutral" className={className}>
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant={toneToBadgeVariant[meta.tone]} className={className}>
      {meta.label}
    </Badge>
  );
}
