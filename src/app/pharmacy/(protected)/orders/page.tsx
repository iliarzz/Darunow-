"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatOrderId } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types-v2";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const tabGroups: { key: string; statuses: OrderStatus[]; label: string }[] = [
  { key: "new", statuses: ["created"], label: "جدید" },
  { key: "rx", statuses: ["rx_received", "rx_review"], label: "در بررسی نسخه" },
  { key: "prep", statuses: ["approved", "preparing"], label: "آماده‌سازی" },
  { key: "ship", statuses: ["shipped"], label: "ارسال‌شده" },
  { key: "done", statuses: ["delivered"], label: "تکمیل‌شده" },
];

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pharmacy/orders");
        if (!res.ok) throw new Error("failed");
        setOrders(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">سفارش‌های داروخانه</h1>
          <p className="text-sm text-muted">مدیریت سفارش‌های در جریان</p>
        </div>
        <Badge variant="outline">{orders.length} مورد</Badge>
      </div>
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-5">
          {tabGroups.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="w-full">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabGroups.map((tab) => {
          const items = useMemo(
            () => orders.filter((o) => tab.statuses.includes(o.status)),
            [orders, tab.statuses],
          );
          return (
            <TabsContent key={tab.key} value={tab.key} className="space-y-3">
              {loading && <OrdersSkeleton />}
              {!loading && items.length === 0 && (
                <EmptyState title="موردی نیست" description="سفارشی در این بخش ثبت نشده." />
              )}
              {!loading &&
                items.map((order) => <OrderCard key={order.id} order={order} />)}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="flex items-center justify-between gap-3 border border-border/60 bg-card/90 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text">سفارش {formatOrderId(order.id)}</p>
        <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
        <p className="text-xs text-muted">{order.items.length} قلم</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="info">{order.status}</Badge>
        <Button asChild size="sm" variant="secondary" className="rounded-full">
          <Link href={`/pharmacy/orders/${order.id}`}>جزئیات</Link>
        </Button>
      </div>
    </Card>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border border-border/60 bg-card/80 p-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="mt-2 h-3 w-40 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
