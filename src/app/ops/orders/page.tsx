"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney, formatOrderId } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types-v2";
import { ORDER_STATUS_FLOW } from "@/constants/status";

const OPS_KEY = process.env.NEXT_PUBLIC_OPS_KEY;

export default function OpsOrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">در حال بارگذاری...</p>}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const search = useSearchParams();
  const keyFromUrl = search?.get("key") ?? "";
  const keyValid = !OPS_KEY || keyFromUrl === OPS_KEY;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const opsKeyParam = useMemo(() => (OPS_KEY ? `?opsKey=${OPS_KEY}` : keyFromUrl ? `?opsKey=${keyFromUrl}` : ""), [keyFromUrl]);

  useEffect(() => {
    if (!keyValid) return;
    const run = async () => {
      try {
        const res = await fetch(`/api/orders${opsKeyParam}`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [keyValid, opsKeyParam]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${id}${opsKeyParam}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const updated: Order = await res.json();
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  if (!keyValid) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-text">OPS / Orders</h1>
        <p className="text-sm text-muted">Access denied. Append ?key=... to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">OPS / Orders</h1>
        <Badge variant="outline">{orders.length} رکورد</Badge>
      </div>

      {loading && <p className="text-sm text-muted">در حال بارگذاری...</p>}

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
