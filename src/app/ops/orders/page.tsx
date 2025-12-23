"use client";

import { Suspense, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney, formatOrderId } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types-v2";
import { ORDER_STATUS_FLOW } from "@/constants/status";

export default function OpsOrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">در حال بارگذاری...</p>}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/orders`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setOrders(data);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("بروزرسانی انجام نشد");
      return;
    }
    const updated: Order = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">OPS / Orders</h1>
        <Badge variant="outline">{orders.length} رکورد</Badge>
      </div>

      {loading && <p className="text-sm text-muted">در حال بارگذاری...</p>}
      {error && <p className="text-sm text-warning">{error}</p>}

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="space-y-2 border border-border/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text">سفارش {formatOrderId(order.id)}</p>
                <p className="text-xs text-muted">
                  {formatDate(order.createdAt)} — مبلغ {formatMoney(order.payable ?? order.total)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="rounded-full border border-border px-3 py-1 text-sm"
                >
                  {ORDER_STATUS_FLOW.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                  <option value="cancelled">cancelled</option>
                  <option value="refunding">refunding</option>
                  <option value="refunded">refunded</option>
                </select>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              <Badge variant="neutral">{order.items.length} قلم</Badge>
              {order.pharmacyId && <Badge variant="neutral">داروخانه: {order.pharmacyId}</Badge>}
              <Badge variant="neutral">پرداخت: {order.paymentType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <a href={`/orders/${order.id}`} target="_blank" rel="noreferrer">
                  مشاهده کاربر
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
