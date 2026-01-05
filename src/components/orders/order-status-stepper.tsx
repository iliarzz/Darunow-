"use client";

import { CheckCircle2, Package, ShieldCheck, Truck, Zap, XCircle, RotateCcw, RefreshCw } from "lucide-react";
import { Stepper, type StepItem } from "@/components/ui/stepper";
import { ORDER_STATUS_FLOW } from "@/constants/status";
import type { OrderStatus } from "@/lib/types-v2";
import { formatDate, formatTime } from "@/lib/format";

const statusIcon: Record<OrderStatus, React.ReactNode> = {
  created: <Zap className="h-4 w-4" />,
  rx_received: <ShieldCheck className="h-4 w-4" />,
  rx_review: <ShieldCheck className="h-4 w-4" />,
  needs_fix: <RotateCcw className="h-4 w-4" />,
  approved: <ShieldCheck className="h-4 w-4" />,
  preparing: <Package className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  refund_requested: <RotateCcw className="h-4 w-4" />,
  refunding: <RotateCcw className="h-4 w-4" />,
  refunded: <RefreshCw className="h-4 w-4" />,
};

type TimelineEvent = { status: OrderStatus; at?: number; note?: string };

const refundFlow: OrderStatus[] = [
  "created",
  "rx_received",
  "rx_review",
  "approved",
  "preparing",
  "refund_requested",
  "refunding",
  "refunded",
];
const cancelledFlow: OrderStatus[] = ["created", "rx_received", "cancelled"];

export function OrderStatusStepper({ events, current }: { events: TimelineEvent[]; current: OrderStatus }) {
  const flow = resolveFlow(current);
  const steps: StepItem[] = flow.map((status) => {
    const event = events.find((e) => e.status === status);
    const stateIndex = flow.indexOf(current);
    const stepIndex = flow.indexOf(status);
    const state: StepItem["state"] =
      stateIndex > stepIndex ? "completed" : stateIndex === stepIndex ? "active" : "pending";

    return {
      title: translateStatus(status),
      description: event?.at ? `${formatDate(event.at)} • ${formatTime(event.at)}` : undefined,
      icon: statusIcon[status],
      state,
    };
  });

  return <Stepper steps={steps} />;
}

function resolveFlow(status: OrderStatus): OrderStatus[] {
  if (status === "cancelled") return cancelledFlow;
  if (status === "refund_requested" || status === "refunding" || status === "refunded") return refundFlow;
  return ORDER_STATUS_FLOW;
}

function translateStatus(status: OrderStatus): string {
  switch (status) {
    case "created":
      return "ثبت شد";
    case "rx_received":
      return "نسخه دریافت شد";
    case "rx_review":
      return "تایید نسخه";
    case "needs_fix":
      return "نیاز به اصلاح";
    case "approved":
      return "تایید شده";
    case "preparing":
      return "آماده‌سازی";
    case "shipped":
      return "ارسال شده";
    case "delivered":
      return "تحویل شد";
    case "cancelled":
      return "لغو شد";
    case "refund_requested":
      return "درخواست بازگشت";
    case "refunding":
      return "در حال بازگشت";
    case "refunded":
      return "بازگشت شد";
    default:
      return status;
  }
}
