"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InfoChip } from "@/components/ui/InfoChip";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { portalApi } from "@/lib/portal/api";
import type { Order } from "@/lib/orders/types";
import { AlertTriangle, Clock3, Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const reviewTabs = [
  { key: "pending", label: "در انتظار بررسی", filter: (o: Order) => o.prescription?.reviewStatus === "PENDING_REVIEW" },
  { key: "clarify", label: "نیاز به توضیح", filter: (o: Order) => o.prescription?.reviewStatus === "NEED_CLARIFICATION" },
  { key: "approved", label: "تایید شده", filter: (o: Order) => o.prescription?.reviewStatus === "APPROVED" },
  { key: "rejected", label: "رد شده", filter: (o: Order) => o.prescription?.reviewStatus === "REJECTED" },
];

const SLA_MINUTES = 20;

export default function PortalPrescriptionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [viewer, setViewer] = useState<{ open: boolean; image?: string; zoom: number; rotate: number }>({ open: false, zoom: 1, rotate: 0 });
  const [drawer, setDrawer] = useState<Order | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalApi.listOrders();
      setOrders(data.filter((o) => o.type === "PRESCRIPTION"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت نسخه‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => orders.filter((o) => reviewTabs.find((t) => t.key === tab)?.filter(o) ?? true), [orders, tab]);

  const openViewer = (img: string) => setViewer({ open: true, image: img, zoom: 1, rotate: 0 });

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await portalApi.reviewPrescription(orderId, status, note);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                prescription: { ...(o.prescription ?? { id: orderId, imageUrls: [] }), reviewStatus: status as any },
              }
            : o,
        ),
      );
      setNote("");
      toast({ title: "ثبت شد" });
      setDrawer(null);
    } catch (err) {
      toast({ title: "خطا", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted">بررسی نسخه‌ها</p>
            <h1 className="text-2xl font-bold text-primary-900">صف نسخه‌ها</h1>
            <p className="text-[12px] text-muted">SLA {SLA_MINUTES} دقیقه‌ای برای پاسخ اولیه</p>
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4 gap-2">
          {reviewTabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {error && <ErrorState title="خطا در بارگذاری نسخه‌ها" description="لطفا دوباره تلاش کنید." details={error} onRetry={loadOrders} />}
        <TabsContent value={tab} className="space-y-3">
          {loading && <PrescriptionsSkeleton />}
          {!loading && filtered.length === 0 && <EmptyState title="موردی نیست" description="نسخه‌ای در این بخش وجود ندارد." />}
          {!loading &&
            filtered.map((order) => {
              const prescription = order.prescription;
              const waitLabel = formatWait(order.createdAt, now);
              const slaRemainingMs = Math.max(0, order.createdAt + SLA_MINUTES * 60000 - now);
              const slaMinutesLeft = Math.ceil(slaRemainingMs / 60000);
              return (
                <Card key={order.id} className="flex flex-col gap-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <InfoChip>
                        <Clock3 className="h-4 w-4 text-muted" />
                        {waitLabel}
                      </InfoChip>
                      <Badge variant={slaRemainingMs === 0 ? "warning" : "neutral"} className="rounded-full px-3 py-[6px] text-[11px]">
                        SLA: {slaRemainingMs === 0 ? "به اتمام رسید" : `${slaMinutesLeft} دقیقه`}
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                        Rx
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted">
                        سفارش <span className="ltr inline-flex">{order.id}</span>
                      </p>
                      <p className="text-lg font-bold text-primary-900">{order.customerName}</p>
                      <p className="text-[12px] text-muted">{order.deliveryAddressText}</p>
                    </div>
                    {prescription?.imageUrls?.length ? (
                      <div className="flex items-center gap-2">
                        {prescription.imageUrls.slice(0, 2).map((img) => (
                          <button
                            key={img}
                            type="button"
                            className="h-16 w-20 overflow-hidden rounded-xl border border-divider bg-surface-2 transition hover:ring-2 hover:ring-primary-500"
                            onClick={() => openViewer(img)}
                          >
                            <img src={img} alt="rx" className="h-full w-full object-cover" />
                          </button>
                        ))}
                        {prescription.imageUrls.length > 2 && (
                          <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                            +{prescription.imageUrls.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-divider bg-surface-2 px-3 py-2 text-sm text-muted">
                        <AlertTriangle className="h-4 w-4 text-warning" /> تصویر نسخه موجود نیست.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:gap-3">
                    <Button className="rounded-full" onClick={() => setDrawer(order)}>
                      بررسی
                    </Button>
                    <p className="text-[12px] text-muted">جزئیات بیشتر در Drawer</p>
                  </div>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>

      <PrescriptionViewer viewer={viewer} setViewer={setViewer} />

      <Sheet open={Boolean(drawer)} onOpenChange={(open) => !open && setDrawer(null)}>
        <SheetContent side="right" className="max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>بررسی نسخه</SheetTitle>
          </SheetHeader>
          {!drawer && <p className="text-sm text-muted">در حال بارگذاری...</p>}
          {drawer && (
            <div className="space-y-3 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted">سفارش {drawer.id}</p>
                <p className="text-base font-semibold text-primary-900">{drawer.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                {(drawer.prescription?.imageUrls ?? []).slice(0, 1).map((img) => (
                  <button
                    key={img}
                    type="button"
                    className="h-40 w-full overflow-hidden rounded-xl border border-divider bg-surface-2 transition hover:ring-2 hover:ring-primary-500"
                    onClick={() => openViewer(img)}
                  >
                    <img src={img} alt="rx" className="h-full w-full object-contain" />
                  </button>
                ))}
                {drawer.prescription?.imageUrls?.length === 0 && <p className="text-sm text-muted">تصویر موجود نیست.</p>}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary-900">پیام سریع</p>
                <div className="flex flex-wrap gap-2">
                  {["دارو موجود است", "نیاز به نسخه واضح‌تر", "تماس بگیرید"].map((m) => (
                    <Button key={m} size="sm" variant="secondary" className="rounded-full" onClick={() => setNote(m)}>
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح کوتاه (برای رد/توضیح اجباری)" />
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                    وضعیت فعلی: {drawer.prescription?.reviewStatus ?? "PENDING_REVIEW"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" className="rounded-full" onClick={() => updateStatus(drawer.id, "APPROVED")}>
                    تایید
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    disabled={!note}
                    onClick={() => updateStatus(drawer.id, "NEED_CLARIFICATION")}
                  >
                    نیاز به توضیح
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    disabled={!note}
                    onClick={() => updateStatus(drawer.id, "REJECTED")}
                  >
                    رد
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PrescriptionViewer({
  viewer,
  setViewer,
}: {
  viewer: { open: boolean; image?: string; zoom: number; rotate: number };
  setViewer: (v: { open: boolean; image?: string; zoom: number; rotate: number }) => void;
}) {
  const zoom = viewer.zoom || 1;
  const rotate = viewer.rotate || 0;
  return (
    <Sheet open={viewer.open} onOpenChange={(open) => setViewer({ ...viewer, open })}>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <div className="flex h-[60vh] items-center justify-center overflow-hidden rounded-2xl bg-surface-1">
          {viewer.image && (
            <img
              src={viewer.image}
              alt="Prescription fullscreen"
              className="max-h-full max-w-full object-contain transition-transform"
              style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
            />
          )}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full p-0"
            onClick={() => setViewer({ ...viewer, zoom: Math.min(zoom + 0.2, 3) })}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full p-0"
            onClick={() => setViewer({ ...viewer, zoom: Math.max(1, zoom - 0.2) })}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full p-0"
            onClick={() => setViewer({ ...viewer, rotate: rotate + 90 })}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="h-10 w-10 rounded-full p-0" onClick={() => setViewer({ ...viewer, open: false })}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatWait(createdAt: number, now: number) {
  const diff = Math.max(0, now - createdAt);
  const minutes = Math.floor(diff / 60000);
  return `${minutes} دقیقه`;
}

function PrescriptionsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border border-divider bg-surface-1/80 p-4">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="mt-2 h-3 w-40 rounded-full" />
          <Skeleton className="mt-2 h-20 w-full rounded-xl" />
        </Card>
      ))}
    </div>
  );
}
