import type { Order, PaymentMethod } from "@/lib/orders/types";

const PAYMENT_MAP: Record<string, PaymentMethod> = {
  online_shaparak: "ONLINE_SHAPARAK",
  cod_card_reader: "COD_CARD_READER",
  card_to_card: "CARD_TO_CARD",
  ONLINE_SHAPARAK: "ONLINE_SHAPARAK",
  COD_CARD_READER: "COD_CARD_READER",
  CARD_TO_CARD: "CARD_TO_CARD",
};

export function normalizeOrderForPortal(order: Order): Order {
  const normalizedType = String(order.type).toLowerCase() === "prescription" ? "PRESCRIPTION" : "STANDARD";
  const normalizedPayment = PAYMENT_MAP[order.paymentMethod] ?? "ONLINE_SHAPARAK";

  return {
    ...order,
    type: normalizedType,
    paymentMethod: normalizedPayment,
    substitutions: order.substitutions ?? [],
    audit: order.audit ?? [],
    prescription: order.prescription
      ? {
          ...order.prescription,
          reviewStatus: order.prescription.reviewStatus ?? "PENDING_REVIEW",
        }
      : order.prescription,
  };
}
