import { Badge } from "@/components/ui/badge";
import { mockStore } from "@/lib/mock/store";
import { formatDate } from "@/lib/format";
import type { AccessGrant } from "@/lib/types";

export function AccessGrantBadge({ grant }: { grant: AccessGrant }) {
  const pharmacy = mockStore.getPharmacies().find((p) => p.id === grant.pharmacyId);
  return (
    <Badge variant="outline" className="flex flex-wrap items-center gap-2 text-xs">
      <span>{pharmacy?.name ?? grant.pharmacyId}</span>
      <span className="text-muted">سفارش {grant.orderId}</span>
      <span className="text-muted">انقضا {formatDate(grant.expiresAt)}</span>
    </Badge>
  );
}
