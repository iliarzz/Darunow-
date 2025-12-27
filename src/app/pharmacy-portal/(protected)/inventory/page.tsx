"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/use-toast";
import { portalApi } from "@/lib/portal/api";
import { formatDate } from "@/lib/format";

type InventoryItem = { productId: string; stock: number; lowStockThreshold?: number; expiresAt?: number };

export default function PortalInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("all");
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await portalApi.listInventory();
        setItems(data as InventoryItem[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در دریافت موجودی");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const lowStock = useMemo(() => items.filter((i) => i.lowStockThreshold !== undefined && i.stock <= (i.lowStockThreshold ?? 0)), [items]);
  const expiringSoon = useMemo(
    () => items.filter((i) => i.expiresAt && i.expiresAt - Date.now() < 30 * 24 * 60 * 60 * 1000),
    [items],
  );
  const filtered = useMemo(() => {
    if (tab === "low") return lowStock;
    if (tab === "expiring") return expiringSoon;
    return items;
  }, [expiringSoon, items, lowStock, tab]);

  const adjustStock = async (productId: string, delta: number) => {
    if (!window.confirm(`موجودی محصول ${productId} ${delta > 0 ? "افزایش" : "کاهش"} یابد؟`)) return;
    setAdjusting(productId);
    try {
      await portalApi.adjustInventory(productId, delta);
      setItems((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, stock: Math.max(0, (item.stock ?? 0) + delta) } : item)),
      );
      toast({ title: "به‌روزرسانی شد", description: `موجودی جدید برای ${productId}` });
    } catch (err) {
      toast({ title: "خطا در به‌روزرسانی", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setAdjusting(null);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">موجودی انبار</p>
            <h1 className="text-2xl font-bold text-primary-900">کنترل موجودی</h1>
          </div>
          <Badge variant={lowStock.length > 0 ? "warning" : "neutral"} className="rounded-full px-3 py-[6px] text-[12px]">
            هشدار کمبود: {lowStock.length}
          </Badge>
        </div>
      </Card>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "all", label: "همه" },
          { value: "low", label: "کمبود" },
          { value: "expiring", label: "نزدیک انقضا" },
        ]}
        className="rounded-2xl border border-divider bg-surface-1/90 p-1 shadow-soft"
      />

      {loading && <InventorySkeleton />}
      {error && <ErrorState title="خطا در بارگذاری موجودی" description="دسترسی برقرار نشد." details={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="آیتمی در این بخش نیست" description="بعدا دوباره سر بزنید." />}

      {!loading && !error && filtered.length > 0 && (
        <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary-900">
              {tab === "low" ? "اقلام در کمبود" : tab === "expiring" ? "نزدیک انقضا" : "همه اقلام"}
            </p>
            <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
              {filtered.length} مورد
            </Badge>
          </div>
          <div className="space-y-2">
            {filtered.map((item) => {
              const isLow = item.stock <= (item.lowStockThreshold ?? 0);
              const isExpiring = item.expiresAt ? item.expiresAt - Date.now() < 30 * 24 * 60 * 60 * 1000 : false;
              return (
                <div
                  key={item.productId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-divider bg-surface-2 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-primary-900">محصول {item.productId}</p>
                    {item.expiresAt && (
                      <p className="text-[12px] text-muted">انقضا: {formatDate(item.expiresAt)}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isLow ? "warning" : "neutral"} className="rounded-full px-2 py-[6px] text-[12px]">
                      موجودی: {item.stock}
                    </Badge>
                    {isExpiring && (
                      <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px] text-warning">
                        نزدیک انقضا
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        disabled={adjusting === item.productId}
                        onClick={() => adjustStock(item.productId, -1)}
                      >
                        -
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        disabled={adjusting === item.productId}
                        onClick={() => adjustStock(item.productId, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!loading && !error && lowStock.length > 0 && (
        <Card className="space-y-2 rounded-2xl border border-warning/40 bg-warning/10 p-4 shadow-soft">
          <p className="text-sm font-semibold text-primary-900">هشدار کمبود موجودی</p>
          {lowStock.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded-xl border border-warning/40 bg-surface-1/60 px-3 py-2 text-sm">
              <span>محصول {item.productId}</span>
              <Badge variant="warning" className="rounded-full px-2 py-[6px] text-[12px]">
                موجودی {item.stock}
              </Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border border-divider bg-surface-1/80 p-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="mt-2 h-3 w-24 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
