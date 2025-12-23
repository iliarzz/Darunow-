import type { OrderStatus } from "@/lib/types-v2";

export type StatusTone = "success" | "info" | "warning" | "error" | "neutral";

export const ORDER_STATUS_FLOW: OrderStatus[] = ["created", "rx_received", "rx_review", "approved", "preparing", "shipped", "delivered"];

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: StatusTone }> = {
  created: { label: "ثبت شد", tone: "info" },
  rx_received: { label: "نسخه دریافت شد", tone: "warning" },
  rx_review: { label: "تایید نسخه", tone: "info" },
  approved: { label: "تایید شده", tone: "info" },
  preparing: { label: "آماده‌سازی", tone: "info" },
  shipped: { label: "ارسال شد", tone: "info" },
  delivered: { label: "تحویل شد", tone: "success" },
  cancelled: { label: "لغو شد", tone: "error" },
  refund_requested: { label: "درخواست بازگشت", tone: "warning" },
  refunding: { label: "در حال بازگشت", tone: "warning" },
  refunded: { label: "بازگشت شد", tone: "success" },
};

export const toneToBadgeVariant: Record<StatusTone, "success" | "info" | "warning" | "error" | "neutral"> = {
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
  neutral: "neutral",
};
