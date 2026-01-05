import type { Order, OrderItem, SubstitutionProposal } from "./types";

export function calculateItemsTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

export function calculateOrderTotal(items: OrderItem[], substitutions?: SubstitutionProposal[]): number {
  const base = calculateItemsTotal(items);
  if (!substitutions?.length) return base;
  const adjustment = substitutions.reduce((sum, proposal) => {
    const original = items.find((item) => item.id === proposal.originalItemId);
    if (!original) return sum + proposal.suggestedUnitPrice;
    const originalTotal = original.unitPrice * original.qty;
    const proposedTotal = proposal.suggestedUnitPrice * original.qty;
    return sum + (proposedTotal - originalTotal);
  }, 0);
  return Math.max(0, Math.round(base + adjustment));
}

export function withComputedTotal<T extends Pick<Order, "items"> & Partial<Order>>(order: T): T & { total: number } {
  return {
    ...order,
    total: calculateOrderTotal(order.items, order.substitutions),
  };
}
