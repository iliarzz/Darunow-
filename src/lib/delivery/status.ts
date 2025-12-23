import type { DeliveryStatus, OrderStatus } from "@prisma/client";

const allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  unassigned: ["offered", "cancelled"],
  offered: ["accepted", "cancelled"],
  accepted: ["picked_up", "enroute", "arrived", "failed", "cancelled"],
  picked_up: ["enroute", "arrived", "failed", "cancelled"],
  enroute: ["arrived", "failed", "cancelled"],
  arrived: ["delivered", "failed", "cancelled"],
  delivered: [],
  failed: [],
  cancelled: [],
};

export function canTransitionDeliveryStatus(current: DeliveryStatus, next: DeliveryStatus): boolean {
  if (current === next) return true;
  return (allowedTransitions[current] ?? []).includes(next);
}

export function assertDeliveryStatusTransition(current: DeliveryStatus, next: DeliveryStatus) {
  if (!canTransitionDeliveryStatus(current, next)) {
    throw new Error(`Invalid delivery status transition: ${current} → ${next}`);
  }
}

export function orderStatusForDelivery(status: DeliveryStatus): OrderStatus | undefined {
  switch (status) {
    case "accepted":
    case "picked_up":
    case "enroute":
    case "arrived":
      return "shipped";
    case "delivered":
      return "delivered";
    case "failed":
    case "cancelled":
      return "cancelled";
    default:
      return undefined;
  }
}

export function isDeliveryTerminal(status: DeliveryStatus): boolean {
  return status === "delivered" || status === "failed" || status === "cancelled";
}
