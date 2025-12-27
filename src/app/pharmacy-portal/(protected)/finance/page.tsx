"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { portalApi } from "@/lib/portal/api";
import { formatToman } from "@/lib/money";

type Settlement = { id: string; period: string; gross: number; net: number; fees: number; refunds?: number; disputes?: number; status?: string };

export default function PortalFinancePage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await portalApi.listSettlements();
        setSettlements(data as Settlement[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات مالی");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totals = settlements.reduce(
    (acc, s) => {
      acc.gross += s.gross ?? 0;
      acc.net += s.net ?? 0;
      acc.fees += s.fees ?? 0;
      acc.refunds += s.refunds ?? 0;
      acc.disputes += s.disputes ?? 0;
      return acc;
    },
    { gross: 0, net: 0, fees: 0, refunds: 0, disputes: 0 },
  );

  const trend = useMemo(() => {
    const base = settlements.slice(0, 6);
    if (base.length === 0) return [1200000, 900000, 1400000, 1100000, 1500000, 1300000];
    return base.map((s) => s.net ?? 0);
  }, [settlements]);

  const filteredSettlements = useMemo(() => {
    if (periodFilter === "all") return settlements;
    if (periodFilter === "recent") return settlements.slice(0, 6);
    return settlements.filter((s) => (s.status ?? "").toLowerCase().includes(periodFilter.toLowerCase()));
  }, [periodFilter, settlements]);

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">تسویه و مالی</p>
            <h1 className="text-2xl font-bold text-primary-900">وضعیت مالی</h1>
            <p className="text-[12px] text-muted">نگاه سریع به مبالغ؛ جزئیات در لایه بعدی.</p>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="secondary" className="rounded-full">
                  <Filter className="me-1 h-4 w-4" /> فیلترها
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60">
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="period" value="all" checked={periodFilter === "all"} onChange={() => setPeriodFilter("all")} />
                    همه دوره‌ها
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="period" value="recent" checked={periodFilter === "recent"} onChange={() => setPeriodFilter("recent")} />
                    ۶ دوره اخیر
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="period" value="paid" checked={periodFilter === "paid"} onChange={() => setPeriodFilter("paid")} />
                    فقط پرداخت‌شده
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="period" value="pending" checked={periodFilter === "pending"} onChange={() => setPeriodFilter("pending")} />
                    در انتظار
                  </label>
                  <Button variant="ghost" className="w-full rounded-full" onClick={() => setPeriodFilter("all")}>
                    پاک‌سازی
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <a href="/api/portal/settlements?download=1">دانلود گزارش</a>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="ناخالص" value={formatToman(totals.gross)} />
        <MetricCard label="کارمزد" value={formatToman(totals.fees)} />
        <MetricCard label="خالص قابل تسویه" value={formatToman(totals.net)} />
        <MetricCard label="بازپرداخت/اختلاف" value={formatToman(totals.refunds + totals.disputes)} />
      </div>

      <Card className="rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
        <p className="text-sm text-muted">روند خالص تسویه</p>
        <div className="mt-3 flex items-end gap-2">
          {trend.map((v, idx) => {
            const max = Math.max(...trend, 1);
            const h = Math.max(12, Math.round((v / max) * 80));
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-muted">{(idx + 1).toLocaleString("fa-IR")}</span>
                <div className="w-8 rounded-full bg-accent-200" style={{ height: h }} />
              </div>
            );
          })}
        </div>
      </Card>

      {error && <ErrorState title="خطا در بارگذاری مالی" description="لطفا اتصال را بررسی کنید." details={error} onRetry={() => window.location.reload()} />}
      {loading && <FinanceSkeleton />}
      {!loading && !error && settlements.length === 0 && <EmptyState title="تسویه‌ای ثبت نشده" />}
      <div className="grid gap-3 md:grid-cols-2">
        {filteredSettlements.map((s) => (
          <Card key={s.id} className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-900">دوره {s.period}</p>
              <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
                {s.id}
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <p className="text-sm text-muted">ناخالص: {formatToman(s.gross)}</p>
              <p className="text-sm text-muted">کارمزد: {formatToman(s.fees)}</p>
              <p className="text-sm text-muted">بازپرداخت: {formatToman(s.refunds ?? 0)}</p>
              <p className="text-sm text-muted">اختلاف/Disputes: {formatToman(s.disputes ?? 0)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary-900">خالص: {formatToman(s.net)}</p>
              <Badge variant="neutral" className="rounded-full px-2 py-[6px] text-[12px]">
                {s.status ?? "در انتظار"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full" onClick={() => setSelected(s)}>
                مشاهده
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full">
                دانلود
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>جزئیات تسویه {selected?.period}</DialogTitle>
          </DialogHeader>
          {!selected && <p className="text-sm text-muted">در حال بارگذاری...</p>}
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-divider bg-surface-2 p-3 text-sm">
                <span className="text-muted">ناخالص</span>
                <span className="text-primary-900">{formatToman(selected.gross)}</span>
                <span className="text-muted">کارمزد</span>
                <span className="text-primary-900">{formatToman(selected.fees)}</span>
                <span className="text-muted">بازپرداخت</span>
                <span className="text-primary-900">{formatToman(selected.refunds ?? 0)}</span>
                <span className="text-muted">اختلاف</span>
                <span className="text-primary-900">{formatToman(selected.disputes ?? 0)}</span>
                <span className="text-muted">خالص</span>
                <span className="text-primary-900 font-semibold">{formatToman(selected.net)}</span>
              </div>
              <div className="space-y-1 rounded-xl border border-divider bg-surface-2 p-3 text-sm">
                <p className="text-sm font-semibold text-primary-900">جزئیات ردیف‌ها</p>
                <p className="text-xs text-muted">لیست کامل تراکنش‌ها در CSV موجود است.</p>
                <div className="grid grid-cols-[1.5fr,1fr,1fr] gap-2 text-[12px] text-muted">
                  <span className="font-semibold text-primary-900">شرح</span>
                  <span className="font-semibold text-primary-900">مبلغ</span>
                  <span className="font-semibold text-primary-900">نوع</span>
                  <span>کمیسیون</span>
                  <span>{formatToman(Math.round(selected.fees / 2))}</span>
                  <span>کارمزد</span>
                  <span>درگاه</span>
                  <span>{formatToman(Math.round(selected.fees / 2))}</span>
                  <span>کارمزد</span>
                  <span>بازپرداخت</span>
                  <span>{formatToman(selected.refunds ?? 0)}</span>
                  <span>بازپرداخت</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FinanceSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border border-divider bg-surface-1/80 p-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="mt-2 h-3 w-28 rounded-full" />
          <Skeleton className="mt-2 h-6 w-24 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
