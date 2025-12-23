"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/format";
import { StatusPill } from "@/components/orders/status-pill";
import { syncOrdersFromServer, useOrder } from "@/stores/orders";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OrderSuccess({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams?.orderId;
  const order = useOrder(orderId);

  useEffect(() => {
    if (!order && orderId) {
      void syncOrdersFromServer();
    }
  }, [order, orderId]);

  if (!orderId) {
    return (
      <EmptyState
        title="سفارش پیدا نشد"
        description="شناسه سفارش نامعتبر است."
        action={{ label: "بازگشت به خانه", href: "/" }}
      />
    );
  }

  const createdLabel = order ? `${formatDate(order.createdAt)} • ${formatTime(order.createdAt)}` : "همین حالا";

  return (
    <div className="space-y-4 pb-16">
      <Card className="space-y-3 border border-border bg-surface-1 p-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-200/60 text-primary-800">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-[20px] font-bold text-primary-900">سفارش ثبت شد</h1>
        <p className="text-sm text-muted">جزئیات سفارش در دسترس است.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <Badge variant="outline">شماره سفارش: {orderId}</Badge>
          {order && <StatusPill status={order.status} />}
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock3 className="h-4 w-4" />
            {createdLabel}
          </div>
        </div>
        {order?.deliverySlotId && (
          <p className="text-xs text-primary-900/80">زمان تحویل انتخابی: {order.deliverySlotId}</p>
        )}
      </Card>

      <div className="grid gap-3">
        <Button asChild className="w-full rounded-full">
          <Link href={`/orders/${orderId}`}>پیگیری سفارش</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full rounded-full">
          <Link href={`/support/new?orderId=${orderId}`}>پشتیبانی درباره این سفارش</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full rounded-full">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
      </div>
    </div>
  );
}
