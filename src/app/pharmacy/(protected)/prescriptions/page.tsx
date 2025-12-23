"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";

type Rx = {
  id: string;
  status: string;
  orderId?: string;
  createdAt?: string;
};

export default function PharmacyPrescriptionsPage() {
  const [items, setItems] = useState<Rx[]>([]);

  useEffect(() => {
    // placeholder fetch via orders endpoint to keep page alive
    fetch("/api/pharmacy/orders")
      .then((res) => res.json())
      .then((orders) => {
        const rxs: Rx[] = [];
        orders.forEach((o: any) => {
          if (o.prescriptions) {
            rxs.push(...o.prescriptions);
          }
        });
        setItems(rxs);
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-4 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-text">نسخه‌ها</h1>
        <p className="text-sm text-muted">نسخه‌های نیازمند بررسی</p>
      </div>
      {items.length === 0 && <EmptyState title="نسخه‌ای یافت نشد" description="در حال حاضر نسخه‌ای ندارید." />}
      {items.map((rx) => (
        <Card key={rx.id} className="flex items-center justify-between border border-border/60 p-4">
          <div>
            <p className="text-sm font-semibold text-text">نسخه {rx.id}</p>
            <p className="text-xs text-muted">سفارش: {rx.orderId ?? "-"}</p>
          </div>
          <Badge variant="outline">{rx.status}</Badge>
        </Card>
      ))}
    </div>
  );
}
