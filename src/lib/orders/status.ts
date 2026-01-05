import type { OrderStatus, OrderType } from "./types";

const baseTransitions: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["PHARMACY_REVIEW", "CANCELED"],
  PHARMACY_REVIEW: ["PHARMACY_ACCEPTED", "PHARMACY_REJECTED", "CANCELED"],
  PHARMACY_ACCEPTED: ["PREPARING", "CANCELED"],
  PREPARING: ["READY_FOR_DISPATCH", "CANCELED"],
  READY_FOR_DISPATCH: ["DISPATCHED", "CANCELED"],
  DISPATCHED: ["DELIVERED", "CANCELED"],
  DELIVERED: [],
  PHARMACY_REJECTED: [],
  CANCELED: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus, _orderType?: OrderType): boolean {
  if (from === to) return true;
  const allowed = baseTransitions[from] ?? [];
  return allowed.includes(to);
}

export function canTransition(from: OrderStatus, to: OrderStatus, orderType?: OrderType): boolean {
  return isValidTransition(from, to, orderType);
}

export function assertValidTransition(from: OrderStatus, to: OrderStatus, orderType?: OrderType): void {
  if (!isValidTransition(from, to, orderType)) {
    throw new Error(`Transition from ${from} to ${to} is not allowed.`);
  }
}

export function nextStatuses(status: OrderStatus): OrderStatus[] {
  return baseTransitions[status] ?? [];
}
