"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { listPayments, removePayment, setDefaultPayment } from "@/stores/payment";
import { formatDate } from "@/lib/format";

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState(listPayments());

  useEffect(() => {
    setPayments(listPayments());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 pb-16">
        <Skeleton className="h-6 w-32 rounded-full" />
        {[1, 2].map((k) => (
          <Card key={k} className="space-y-2 p-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">روش‌های پرداخت</h1>
          <p className="text-sm text-muted">پرداخت آنلاین یا در محل</p>
        </div>
        <Button asChild className="rounded-full px-4">
          <Link href="/profile/payments/new">افزودن</Link>
        </Button>
      </div>
      {payments.length === 0 ? (
        <EmptyState title="روش پرداختی اضافه نشده." action={{ label: "افزودن پرداخت", href: "/profile/payments/new" }} />
      ) : (
        <div className="space-y-3">
          {payments.map((pm) => (
            <Card key={pm.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-text">{pm.label}</p>
                <p className="text-xs text-muted">
                  {pm.type === "online" ? "آنلاین" : pm.type === "cod" ? "پرداخت در محل" : "کارت"} • {formatDate(pm.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pm.isDefault && <Badge variant="success">پیش‌فرض</Badge>}
                {!pm.isDefault && (
                  <Button size="sm" variant="outline" onClick={() => { setDefaultPayment(pm.id); setPayments(listPayments()); }}>
                    پیش‌فرض
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    removePayment(pm.id);
                    setPayments(listPayments());
                  }}
                >
                  حذف
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
