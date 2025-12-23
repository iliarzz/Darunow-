"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FadeSlideIn } from "@/components/motion/fade-slide-in";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/orders/status-pill";
import { formatDate, formatMoney, formatOrderId } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOrders } from "@/stores/orders";
import type { Order, OrderStatus } from "@/lib/types-v2";
import { ORDER_STATUS_FLOW } from "@/constants/status";
import { useReorderAction } from "@/components/orders/useReorderAction";
import { Skeleton } from "@/components/ui/skeleton";
import { syncOrdersFromServer } from "@/stores/orders";

const activeStatuses: OrderStatus[] = ["created", "rx_received", "rx_review", "preparing", "shipped", "refunding"];

export default function OrdersPage() {
  const orders = useOrders();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    syncOrdersFromServer().finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => orders.filter((o) => activeStatuses.includes(o.status)), [orders]);
  const history = useMemo(() => orders.filter((o) => !activeStatuses.includes(o.status)), [orders]);

  return (
    <div className="space-y-4 pb-12">
      <FadeSlideIn>
        <h1 className="text-2xl font-bold text-text">سفارش‌ها</h1>
      </FadeSlideIn>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 px-1">
          <TabsTrigger value="active" className="w-full">
            فعال
          </TabsTrigger>
          <TabsTrigger value="history" className="w-full">
            تاریخچه
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3">
          {loading && <OrdersSkeleton />}
          {!loading && active.length === 0 && (
            <EmptyState title="سفارش فعالی ندارید." action={{ label: "شروع سفارش", href: "/pharmacies" }} />
          )}
          {!loading &&
            active.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
        </TabsContent>
        <TabsContent value="history" className="space-y-3">
          {loading && <OrdersSkeleton />}
          {!loading && history.length === 0 && (
            <EmptyState title="هنوز سفارشی ثبت نکرده‌اید." action={{ label: "جستجوی داروخانه‌ها", href: "/pharmacies" }} />
          )}
          {!loading &&
            history.map((order) => (
              <OrderCard key={order.id} order={order} showReorder />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderCard({ order, showReorder }: { order: Order; showReorder?: boolean }) {
  const { reorder, conflictSheet } = useReorderAction();
  const flow =
    order.status === "cancelled"
      ? ["created", "cancelled"]
      : order.status === "refunding" || order.status === "refunded"
        ? ["created", "rx_received", "rx_review", "preparing", "refunding", "refunded"]
        : ORDER_STATUS_FLOW;
  const stepIndex = Math.max(flow.indexOf(order.status), 0);

  return (
    <Card className="space-y-3 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-soft">
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-text">سفارش {formatOrderId(order.id)}</span>
          <span className="text-xs text-muted">تاریخ {formatDate(order.createdAt)}</span>
        </div>
        <div className="text-sm font-bold text-text">{formatMoney(order.payable ?? order.total)}</div>
      </div>
      <div className="flex items-center justify-between">
        <StatusPill status={order.status} />
        <Button asChild size="sm" variant="outline">
          <Link href={`/orders/${order.id}`}>جزئیات</Link>
        </Button>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>مرحله {stepIndex + 1} از {flow.length}</span>
        <span>{order.items.length} قلم</span>
      </div>
      {showReorder && (
        <Button size="sm" variant="secondary" className="w-fit" onClick={() => reorder(order)}>
          تکرار سفارش
        </Button>
      )}
      {conflictSheet}
    </Card>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="space-y-3 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-soft">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </Card>
      ))}
    </div>
  );
}
