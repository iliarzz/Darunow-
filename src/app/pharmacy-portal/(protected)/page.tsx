"use client";

// Portal Sitemap:
// /pharmacy-portal (dashboard)
// /pharmacy-portal/orders
// /pharmacy-portal/orders/[id]
// /pharmacy-portal/prescriptions
// /pharmacy-portal/catalog
// /pharmacy-portal/inventory
// /pharmacy-portal/dispatch
// /pharmacy-portal/finance
// /pharmacy-portal/support
// /pharmacy-portal/staff
// /pharmacy-portal/settings

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InfoChip } from "@/components/ui/InfoChip";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/orders/status-pill";
import { formatToman } from "@/lib/money";
import { portalApi } from "@/lib/portal/api";
import type { Order, OrderStatus } from "@/lib/orders/types";

const doneStatuses: OrderStatus[] = ["DELIVERED", "CANCELED", "PHARMACY_REJECTED"];
const activeStatuses: OrderStatus[] = ["PLACED", "PHARMACY_REVIEW", "PHARMACY_ACCEPTED", "PREPARING", "READY_FOR_DISPATCH", "DISPATCHED"];

export default function PortalDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalApi.listOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری داشبورد با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const todayOrders = useMemo(() => orders.filter((o) => o.createdAt >= todayStart), [orders, todayStart]);
  const clearedToday = useMemo(() => todayOrders.filter((o) => doneStatuses.includes(o.status)).length, [todayOrders]);
  const queueToday = useMemo(() => todayOrders.filter((o) => activeStatuses.includes(o.status)).length, [todayOrders]);
  const progressPercent = useMemo(() => {
    const total = todayOrders.length;
    return total ? Math.round((clearedToday / total) * 100) : 100;
  }, [clearedToday, todayOrders]);
  const caughtUp = queueToday === 0 && todayOrders.length > 0;

  const stats = useMemo(() => {
    const grouped: Record<string, number> = {};
    [...activeStatuses, ...doneStatuses].forEach((k) => {
      grouped[k] = 0;
    });
    orders.forEach((o) => {
      grouped[o.status] = (grouped[o.status] ?? 0) + 1;
    });
    return grouped;
  }, [orders]);

  const revenue = useMemo(
    () => orders.filter((o) => !["CANCELED", "PHARMACY_REJECTED"].includes(o.status)).reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const avgReviewMinutes = useMemo(() => {
    const reviewed = orders.filter((o) => ["PHARMACY_ACCEPTED", "PREPARING", "READY_FOR_DISPATCH", "DISPATCHED", "DELIVERED"].includes(o.status));
    if (!reviewed.length) return null;
    const avg = reviewed.reduce((sum, o) => sum + Math.max(1, (o.updatedAt - o.createdAt) / 60000), 0) / reviewed.length;
    return Math.round(avg);
  }, [orders]);

  const onTimeRate = useMemo(() => {
    const dispatched = orders.filter((o) => o.etaMinutes && ["READY_FOR_DISPATCH", "DISPATCHED", "DELIVERED"].includes(o.status));
    if (!dispatched.length) return null;
    const onTime = dispatched.filter((o) => (o.updatedAt - o.createdAt) / 60000 <= (o.etaMinutes ?? 0) + 5).length;
    return Math.round((onTime / dispatched.length) * 100);
  }, [orders]);

  return (
    <div className="space-y-4 pb-12">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted">پیشخوان عملیات</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-primary-900">داشبورد پرتال</h1>
              {caughtUp && (
                <Badge variant="success" className="rounded-full px-2 py-[4px] text-[12px]">
                  همه چیز مرتب
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-muted">نمای کلی امروز؛ جزئیات فقط هنگام نیاز نمایش داده می‌شوند.</p>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/pharmacy-portal/orders">مدیریت سفارش‌ها</Link>
          </Button>
        </div>
      </Card>

      {error && (
        <ErrorState title="خطا در بارگذاری داشبورد" description="ارتباط برقرار نشد." details={error} onRetry={() => loadOrders()} />
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard title="سفارش‌های فعال" value={activeStatuses.reduce((sum, key) => sum + (stats[key] ?? 0), 0)} loading={loading} tone="info" />
        <StatCard title="سفارش‌های امروز" value={todayOrders.length} loading={loading} tone="brand" helper={`${clearedToday} بسته شد`} />
        <StatCard title="درآمد بالقوه" valueLabel={formatToman(revenue)} loading={loading} tone="success" />
        <StatCard title="ETA به‌موقع" valueLabel={onTimeRate ? `${onTimeRate}%` : "نامشخص"} loading={loading} tone="warning" helper="ارسال سر وقت" />
      </div>

      <RecentOrders loading={loading} orders={orders.slice(0, 6)} />

      <AlertsCard />
    </div>
  );
}

function StatCard({
  title,
  value,
  valueLabel,
  helper,
  loading,
  tone,
}: {
  title: string;
  value?: number;
  valueLabel?: string;
  helper?: string;
  loading?: boolean;
  tone: "info" | "warning" | "success" | "error" | "brand";
}) {
  const toneClass =
    tone === "success"
      ? "text-green-700 bg-green-50"
      : tone === "warning"
        ? "text-amber-700 bg-amber-50"
        : tone === "error"
          ? "text-red-700 bg-red-50"
          : tone === "brand"
            ? "text-primary-800 bg-accent-200"
            : "text-primary-800 bg-surface-2";
  return (
    <Card className="rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary-900">{title}</p>
        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${toneClass}`}>{helper ?? "به‌روز"}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-24 rounded-xl" />
      ) : (
        <p className="mt-3 text-2xl font-bold text-primary-900">{valueLabel ?? value?.toLocaleString("fa-IR") ?? "۰"}</p>
      )}
    </Card>
  );
}

function ProgressCard({
  loading,
  cleared,
  total,
  queue,
  percent,
  caughtUp,
}: {
  loading: boolean;
  cleared: number;
  total: number;
  queue: number;
  percent: number;
  caughtUp: boolean;
}) {
  return (
    <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted">پیشرفت امروز</p>
          <h2 className="text-lg font-bold text-primary-900">تکمیل سفارش‌های امروز</h2>
        </div>
        <InfoChip>
          <span className="text-xs text-muted">Cleared</span> {cleared.toLocaleString("fa-IR")} / {total.toLocaleString("fa-IR")}
        </InfoChip>
      </div>
      <div className="space-y-2 rounded-xl border border-divider bg-surface-2/70 p-3">
        <div className="h-2.5 w-full rounded-full bg-surface-1">
          <div
            className="h-full rounded-full bg-primary-600 transition-[width]"
            style={{ width: loading ? "0%" : `${Math.min(100, percent)}%` }}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <InfoChip>
            <span className="text-xs text-muted">در صف</span>
            {queue.toLocaleString("fa-IR")}
          </InfoChip>
          <InfoChip>
            <span className="text-xs text-muted">بسته شده</span>
            {cleared.toLocaleString("fa-IR")}
          </InfoChip>
          <InfoChip>
            <span className="text-xs text-muted">کل امروز</span>
            {total.toLocaleString("fa-IR")}
          </InfoChip>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between text-sm text-muted">
        <p>گزارش لحظه‌ای از ورودی‌های امروز</p>
        {caughtUp ? <p className="text-success-700">All caught up ✅</p> : <p>در حال پردازش...</p>}
      </div>
    </Card>
  );
}

function EfficiencyCard({ loading, avgReviewMinutes, onTimeRate }: { loading: boolean; avgReviewMinutes: number | null; onTimeRate: number | null }) {
  return (
    <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary-900">کارایی امروز</p>
        <Badge variant="neutral" className="rounded-full px-2 py-[6px] text-[12px]">
          لحظه‌ای
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-divider bg-surface-2/80 p-3">
          <p className="text-[12px] text-muted">میانگین زمان تایید</p>
          {loading ? (
            <Skeleton className="mt-2 h-6 w-20 rounded-lg" />
          ) : (
            <p className="text-xl font-bold text-primary-900">{avgReviewMinutes ? `${avgReviewMinutes} دقیقه` : "نامشخص"}</p>
          )}
          <p className="text-xs text-muted">از ثبت تا تایید داروخانه</p>
        </div>
        <div className="rounded-xl border border-divider bg-surface-2/80 p-3">
          <p className="text-[12px] text-muted">درصد ارسال به موقع</p>
          {loading ? (
            <Skeleton className="mt-2 h-6 w-16 rounded-lg" />
          ) : (
            <p className="text-xl font-bold text-primary-900">{onTimeRate ? `${onTimeRate}%` : "نامشخص"}</p>
          )}
          <p className="text-xs text-muted">مقایسه ETA ثبت‌شده با تحویل</p>
        </div>
      </div>
    </Card>
  );
}

function RecentOrders({ loading, orders }: { loading: boolean; orders: Order[] }) {
  return (
    <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary-900">صف سفارش‌ها (۶ مورد جدید)</p>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/pharmacy-portal/orders">مشاهده همه</Link>
        </Button>
      </div>
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      )}
      {!loading && orders.length === 0 && <EmptyState title="سفارش فعالی نیست." />}
      {!loading &&
        orders.map((order) => (
          <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-divider bg-surface-2/80 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-primary-900">سفارش {order.id}</p>
              <p className="text-[12px] text-muted">{order.customerName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="rounded-full px-2 py-[6px] text-[12px]">
                {order.type === "PRESCRIPTION" ? "نسخه" : "سفارش"}
              </Badge>
              <StatusPill status={order.status} className="rounded-full px-2 py-[6px] text-[12px]" />
              <Button asChild size="sm" className="rounded-full">
                <Link href={`/pharmacy-portal/orders/${order.id}`}>بررسی</Link>
              </Button>
            </div>
          </div>
        ))}
    </Card>
  );
}

function AlertsCard() {
  return (
    <Card className="space-y-2 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary-900">هشدارهای امروز</p>
        <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
          حداکثر ۳ مورد
        </Badge>
      </div>
      <p className="text-sm text-muted">هشداری ثبت نشده است.</p>
    </Card>
  );
}
