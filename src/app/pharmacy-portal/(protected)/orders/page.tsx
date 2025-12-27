"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterBar } from "@/components/ui/FilterBar";
import { InfoChip } from "@/components/ui/InfoChip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/orders/status-pill";
import { portalApi } from "@/lib/portal/api";
import type { Order, OrderStatus, OrderType, PaymentMethod } from "@/lib/orders/types";
import { formatMoney, formatOrderId, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Clock3, CreditCard, MapPin, Package, Pill, Search, Timer } from "lucide-react";

const tabs: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "new", label: "جدید", statuses: ["PLACED", "PHARMACY_REVIEW"] },
  { key: "prep", label: "آماده‌سازی", statuses: ["PHARMACY_ACCEPTED", "PREPARING"] },
  { key: "ship", label: "ارسال", statuses: ["READY_FOR_DISPATCH", "DISPATCHED"] },
  { key: "done", label: "تکمیل‌شده", statuses: ["DELIVERED"] },
  { key: "canceled", label: "لغو/رد", statuses: ["CANCELED", "PHARMACY_REJECTED"] },
];

const paymentLabels: Record<PaymentMethod, string> = {
  ONLINE_SHAPARAK: "آنلاین",
  COD_CARD_READER: "پرداخت در محل",
  CARD_TO_CARD: "کارت به کارت",
  online_shaparak: "آنلاین",
  cod_card_reader: "پرداخت در محل",
  card_to_card: "کارت به کارت",
};

const timeWindowOptions = [
  { value: "all", label: "همه بازه‌ها" },
  { value: "30", label: "۳۰ دقیقه اخیر" },
  { value: "60", label: "۱ ساعت اخیر" },
  { value: "240", label: "۴ ساعت اخیر" },
  { value: "1440", label: "امروز" },
];

export default function PortalOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("new");
  const [q, setQ] = useState("");
  const [type, setType] = useState<OrderType | "">("");
  const [payment, setPayment] = useState<PaymentMethod | "">("");
  const [timeWindow, setTimeWindow] = useState<string>("all");
  const [initialized, setInitialized] = useState(false);
  const [flashIds, setFlashIds] = useState<string[]>([]);
  const seenOrders = useRef<Set<string>>(new Set());

  useEffect(() => {
    const incoming = searchParams.get("q");
    if (incoming !== null) setQ(incoming);
  }, [searchParams]);

  const fetchOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await portalApi.listOrders({ q, type: (type as OrderType) || undefined, payment: (payment as PaymentMethod) || undefined });
        setOrders(data);
        if (!initialized) {
          seenOrders.current = new Set(data.map((o) => o.id));
          setInitialized(true);
        } else {
          const newbies = data.filter((o) => !seenOrders.current.has(o.id)).map((o) => o.id);
          if (newbies.length > 0) {
            newbies.forEach((id) => seenOrders.current.add(id));
            setFlashIds(newbies);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در دریافت سفارش‌ها");
      } finally {
        if (opts?.silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [initialized, payment, q, type],
  );

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchOrders({ silent: true });
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (flashIds.length === 0) return;
    const timer = setTimeout(() => setFlashIds([]), 2200);
    return () => clearTimeout(timer);
  }, [flashIds]);

  const filtered = useMemo(() => {
    const activeStatuses = tabs.find((t) => t.key === tab)?.statuses ?? [];
    const now = Date.now();
    return orders
      .filter((o) => activeStatuses.includes(o.status))
      .filter((o) => {
        if (timeWindow === "all") return true;
        const minutes = Number(timeWindow);
        return now - o.createdAt <= minutes * 60_000;
      });
  }, [orders, tab, timeWindow]);

  const tabCounts = useMemo(() => {
    const now = Date.now();
    return tabs.reduce<Record<string, number>>((acc, t) => {
      acc[t.key] = orders
        .filter((o) => t.statuses.includes(o.status))
        .filter((o) => {
          if (timeWindow === "all") return true;
          const minutes = Number(timeWindow);
          return now - o.createdAt <= minutes * 60_000;
        }).length;
      return acc;
    }, {});
  }, [orders, timeWindow]);

  const resetFilters = () => {
    setQ("");
    setType("");
    setPayment("");
    setTimeWindow("all");
  };

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted">اتاق فرمان سفارش‌ها</p>
            <h1 className="text-2xl font-bold text-primary-900">پایش و مدیریت سفارش‌های داروخانه</h1>
            <p className="text-[12px] text-muted">سفارش‌ها، نسخه‌ها و وضعیت ارسال در یک نما</p>
          </div>
          {refreshing ? (
            <Badge variant="neutral" className="rounded-full px-2 py-[6px] text-[12px]">
              به‌روزرسانی خودکار...
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
              همگام
            </Badge>
          )}
        </div>
      </Card>

      <FilterBar className="top-28 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-divider bg-surface-2/70 px-3 py-2">
            <Search className="h-4 w-4 text-muted" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجو بر اساس شناسه، مشتری یا کالا"
              className="h-8 flex-1 border-none bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0"
            />
          </div>
          <Button variant="ghost" className="rounded-full" onClick={resetFilters} disabled={loading}>
            پاک‌سازی فیلترها
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-xs text-muted">
            <span>نوع سفارش</span>
            <select
              value={type || ""}
              onChange={(e) => setType((e.target.value as OrderType) || "")}
              className="w-full rounded-xl border border-divider bg-surface-2/70 px-3 py-2 text-sm"
            >
              <option value="">همه</option>
              <option value="STANDARD">سفارش</option>
              <option value="PRESCRIPTION">نسخه</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted">
            <span>نوع پرداخت</span>
            <select
              value={payment || ""}
              onChange={(e) => setPayment((e.target.value as PaymentMethod) || "")}
              className="w-full rounded-xl border border-divider bg-surface-2/70 px-3 py-2 text-sm"
            >
              <option value="">همه</option>
              <option value="ONLINE_SHAPARAK">آنلاین</option>
              <option value="COD_CARD_READER">پرداخت در محل</option>
              <option value="CARD_TO_CARD">کارت به کارت</option>
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted">
            <span>بازه زمانی</span>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full rounded-xl border border-divider bg-surface-2/70 px-3 py-2 text-sm"
            >
              {timeWindowOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted">
            <span>نوع دسته</span>
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              className="w-full rounded-xl border border-divider bg-surface-2/70 px-3 py-2 text-sm"
            >
              {tabs.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </FilterBar>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={tabs.map((t) => ({ value: t.key, label: t.label, badge: tabCounts[t.key] ?? 0 }))}
        className="rounded-2xl border border-divider bg-surface-1/90 p-1 shadow-soft"
      />

      {error && (
        <ErrorState
          title="خطا در بارگذاری سفارش‌ها"
          description="ارتباط پایدار نیست. دوباره تلاش کنید."
          details={error}
          onRetry={() => fetchOrders()}
        />
      )}

      {loading && <OrdersSkeleton />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="موردی نیست" description="سفارشی در این بخش ثبت نشده." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} highlight={flashIds.includes(order.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, highlight }: { order: Order; highlight?: boolean }) {
  const waitLabel = useMemo(() => formatWait(order.createdAt), [order.createdAt]);
  const etaLabel = order.etaMinutes ? `${order.etaMinutes} دقیقه` : "در انتظار تعیین";
  const isPrescription = order.type === "PRESCRIPTION";

  return (
    <Card
      className={cn(
        "group grid gap-3 rounded-2xl border border-divider/80 bg-surface-1/95 p-4 shadow-soft transition-all",
        "md:grid-cols-[1.6fr,1fr]",
        highlight && "animate-pulse ring-2 ring-primary-500/70 shadow-elev-2",
      )}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-2 py-[4px] text-[12px]">
            سفارش <span className="ltr ms-1 inline-flex">{formatOrderId(order.id)}</span>
          </Badge>
          {isPrescription && (
            <Badge variant="warning" className="rounded-full px-2 py-[4px] text-[11px]">
              نسخه
            </Badge>
          )}
          <Badge variant="neutral" className="rounded-full px-2 py-[4px] text-[11px]">
            {order.items.length} قلم
          </Badge>
          <StatusPill status={order.status} className="rounded-full px-3 py-[6px] text-[12px]" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-primary-900">
          <span className="line-clamp-1">{order.customerName}</span>
          <span className="text-muted">•</span>
          <span className="text-muted line-clamp-1">
            <MapPin className="mb-[2px] inline h-4 w-4 text-muted" /> {order.deliveryAddressText}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted">
          <InfoChip>
            <Clock3 className="h-4 w-4 text-muted" />
            {waitLabel}
          </InfoChip>
          <span className="flex items-center gap-1">
            <CreditCard className="h-4 w-4 text-muted" />
            {paymentLabels[order.paymentMethod]}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-4 w-4 text-muted" />
            ETA {etaLabel}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-4 w-4 text-muted" />
            {order.items.length} قلم
          </span>
          {isPrescription && (
            <Badge variant="warning" className="rounded-full px-2 py-[4px] text-[11px]">
              نیازمند نسخه
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="text-end">
          <p className="text-sm text-muted">مبلغ کل</p>
          <p className="text-xl font-bold text-primary-900">{formatMoney(order.total)}</p>
          <p className="text-[12px] text-muted">
            ثبت در {formatTime(order.createdAt)} {order.etaMinutes ? `• ETA ${etaLabel}` : ""}
          </p>
        </div>
        <Button asChild className="rounded-full px-4">
          <Link href={`/pharmacy-portal/orders/${order.id}`}>بررسی</Link>
        </Button>
      </div>
    </Card>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="grid gap-3 rounded-2xl border border-divider bg-surface-1/80 p-4 md:grid-cols-[1.6fr,1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-3 w-52 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function formatWait(createdAt: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - createdAt) / 60000));
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه در انتظار`;
  const hours = minutes / 60;
  return `${hours.toFixed(1).toLocaleString("fa-IR")} ساعت در انتظار`;
}
