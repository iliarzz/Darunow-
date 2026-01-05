import type { OrderStatus as LegacyOrderStatus } from "@/lib/types-v2";
import type { OrderStatus as PanelOrderStatus } from "@/lib/orders/types";

export type StatusTone = "success" | "info" | "warning" | "error" | "neutral";

export type AnyOrderStatus = LegacyOrderStatus | PanelOrderStatus;

export const ORDER_STATUS_FLOW: LegacyOrderStatus[] = ["created", "rx_received", "rx_review", "needs_fix", "approved", "preparing", "shipped", "delivered"];

export const ORDER_STATUS_META: Record<AnyOrderStatus, { label: string; tone: StatusTone }> = {
  created: { label: "ثبت شد", tone: "info" },
  rx_received: { label: "نسخه دریافت شد", tone: "warning" },
  rx_review: { label: "تایید نسخه", tone: "info" },
  needs_fix: { label: "نیاز به اصلاح", tone: "warning" },
  approved: { label: "تایید شده", tone: "info" },
  preparing: { label: "آماده‌سازی", tone: "info" },
  shipped: { label: "ارسال شد", tone: "info" },
  delivered: { label: "تحویل شد", tone: "success" },
  cancelled: { label: "لغو شد", tone: "error" },
  refund_requested: { label: "درخواست بازگشت", tone: "warning" },
  refunding: { label: "در حال بازگشت", tone: "warning" },
  refunded: { label: "بازگشت شد", tone: "success" },
  PLACED: { label: "ثبت شد", tone: "info" },
  PHARMACY_REVIEW: { label: "در انتظار تایید داروخانه", tone: "warning" },
  PHARMACY_ACCEPTED: { label: "تایید داروخانه", tone: "info" },
  PHARMACY_REJECTED: { label: "رد شد", tone: "error" },
  PREPARING: { label: "آماده‌سازی", tone: "info" },
  READY_FOR_DISPATCH: { label: "آماده ارسال", tone: "info" },
  DISPATCHED: { label: "تحویل به پیک", tone: "info" },
  DELIVERED: { label: "تحویل شد", tone: "success" },
  CANCELED: { label: "لغو شد", tone: "error" },
};

export const toneToBadgeVariant: Record<StatusTone, "success" | "info" | "warning" | "error" | "neutral"> = {
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
  neutral: "neutral",
};
