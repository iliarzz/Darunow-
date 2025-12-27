"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InfoChip } from "@/components/ui/InfoChip";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { hasPermission } from "@/lib/rbac/permissions";
import { portalApi } from "@/lib/portal/api";
import type { Order } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { usePortalSession } from "@/stores/portal-session";
import { AlertTriangle, Clock3, Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const reviewTabs = [
  { key: "all", label: "همه", filter: () => true },
  { key: "pending", label: "در انتظار", filter: (o: Order) => o.prescription?.reviewStatus === "PENDING_REVIEW" },
  { key: "clarify", label: "نیاز به توضیح", filter: (o: Order) => o.prescription?.reviewStatus === "NEED_CLARIFICATION" },
  { key: "approved", label: "تایید شده", filter: (o: Order) => o.prescription?.reviewStatus === "APPROVED" },
];

const rxTemplates = ["نسخه واضح‌تر ارسال شود.", "داروی جایگزین تایید شود.", "ارسال کد رهگیری نسخه در پیام.", "به شرط موجودی داروخانه تایید می‌شود."];
const SLA_MINUTES = 20;

export default function PortalPrescriptionsPage() {
  const session = usePortalSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [viewer, setViewer] = useState<{ open: boolean; image?: string; zoom: number; rotate: number }>({ open: false, zoom: 1, rotate: 0 });

  const canReview =
    (session?.permissions?.includes("PRESCRIPTIONS_REVIEW") ?? false) ||
    (session ? hasPermission(session.role, "PRESCRIPTIONS_REVIEW") : true);

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

  const handleAction = useCallback(
    async (orderId: string, status: "APPROVED" | "NEED_CLARIFICATION" | "REJECTED") => {
      if (!canReview) {
        toast({ title: "دسترسی محدود", description: "شما مجاز به اقدام روی نسخه‌ها نیستید.", variant: "destructive" });
        return;
      }
      setSubmitting(orderId);
      try {
        const note = noteMap[orderId];
        const updated = await portalApi.reviewPrescription(orderId, status, note || undefined);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        toast({ title: "ثبت شد", description: `وضعیت نسخه: ${status}` });
      } catch (err) {
        toast({ title: "خطا", description: err instanceof Error ? err.message : "خطا در ثبت اقدام", variant: "destructive" });
      } finally {
        setSubmitting(null);
      }
    },
    [canReview, noteMap, toast],
  );

  const openViewer = (img: string) => setViewer({ open: true, image: img, zoom: 1, rotate: 0 });

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted">بررسی نسخه‌ها</p>
            <h1 className="text-2xl font-bold text-primary-900">صف نسخه‌ها</h1>
            <p className="text-[12px] text-muted">SLA {SLA_MINUTES} دقیقه‌ای برای پاسخ اولیه</p>
          </div>
          {!canReview && (
            <Badge variant="warning" className="rounded-full px-3 py-[6px] text-[12px]">
              دسترسی محدود
            </Badge>
          )}
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
          {reviewTabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {error && <ErrorState title="خطا در بارگذاری نسخه‌ها" description="لطفا دوباره تلاش کنید." details={error} onRetry={loadOrders} />}
        {reviewTabs.map((t) => (
          <TabsContent key={t.key} value={t.key} className="space-y-3">
            {loading && <PrescriptionsSkeleton />}
            {!loading && filtered.length === 0 && <EmptyState title="موردی نیست" description="نسخه‌ای در این بخش وجود ندارد." />}
            {!loading &&
              filtered.map((order) => {
                const prescription = order.prescription;
                const waitLabel = formatWait(order.createdAt, now);
                const slaRemainingMs = Math.max(0, order.createdAt + SLA_MINUTES * 60000 - now);
                const slaMinutesLeft = Math.ceil(slaRemainingMs / 60000);
                const note = noteMap[order.id] ?? "";
                return (
                  <Card
                    key={order.id}
                    className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted">
                          سفارش <span className="ltr inline-flex">{order.id}</span>
                        </p>
                        <p className="text-lg font-bold text-primary-900">{order.customerName}</p>
                        <p className="text-[12px] text-muted">{order.deliveryAddressText}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                          {prescription?.reviewStatus ?? "PENDING_REVIEW"}
                        </Badge>
                        <InfoChip>
                          <Clock3 className="h-4 w-4 text-muted" />
                          {waitLabel}
                        </InfoChip>
                        <Badge variant={slaRemainingMs === 0 ? "warning" : "neutral"} className="rounded-full px-3 py-[6px] text-[11px]">
                          SLA: {slaRemainingMs === 0 ? "به اتمام رسید" : `${slaMinutesLeft} دقیقه`}
                        </Badge>
                      </div>
                    </div>

                    {prescription?.imageUrls?.length ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {prescription.imageUrls.slice(0, 3).map((img) => (
                          <button
                            key={img}
                            type="button"
                            className="h-20 w-24 overflow-hidden rounded-xl border border-divider bg-surface-2 transition hover:ring-2 hover:ring-primary-500"
                            onClick={() => openViewer(img)}
                          >
                            <img src={img} alt="rx" className="h-full w-full object-cover" />
                          </button>
                        ))}
                        {prescription.imageUrls.length > 3 && (
                          <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                            +{prescription.imageUrls.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-divider bg-surface-2 px-3 py-2 text-sm text-muted">
                        <AlertTriangle className="h-4 w-4 text-warning" /> تصویر نسخه موجود نیست.
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-primary-900">الگو و توضیح</p>
                      <div className="flex flex-wrap gap-2">
                        {rxTemplates.map((tpl) => (
                          <Chip key={tpl} onClick={() => setNoteMap((prev) => ({ ...prev, [order.id]: tpl }))} selected={note === tpl}>
                            {tpl}
                          </Chip>
                        ))}
                      </div>
                      <Textarea
                        value={note}
                        onChange={(e) => setNoteMap((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        placeholder="پیام برای بیمار یا توضیح داخلی"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" className="rounded-full" disabled={submitting === order.id || !canReview} onClick={() => handleAction(order.id, "APPROVED")}>
                        تایید
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                        disabled={submitting === order.id || !canReview}
                        onClick={() => handleAction(order.id, "NEED_CLARIFICATION")}
                      >
                        نیاز به توضیح
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        disabled={submitting === order.id || !canReview}
                        onClick={() => handleAction(order.id, "REJECTED")}
                      >
                        رد
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="ms-auto rounded-full">
                        <Link href={`/pharmacy-portal/orders/${order.id}`}>جزئیات سفارش</Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </TabsContent>
        ))}
      </Tabs>

      <PrescriptionViewer viewer={viewer} setViewer={setViewer} />
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
    <Dialog open={viewer.open} onOpenChange={(open) => setViewer({ ...viewer, open })}>
      <DialogContent className="max-w-4xl border border-divider bg-surface-1/95 p-0 shadow-elev-2">
        <div className="flex h-[70vh] items-center justify-center overflow-hidden rounded-2xl bg-surface-1">
          {viewer.image && (
            <img
              src={viewer.image}
              alt="Prescription fullscreen"
              className="max-h-full max-w-full object-contain transition-transform"
              style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
            />
          )}
        </div>
        <div className="flex justify-center gap-2 p-3">
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
      </DialogContent>
    </Dialog>
  );
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

function formatWait(createdAt: number, now: number): string {
  const minutes = Math.max(1, Math.round((now - createdAt) / 60000));
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه در انتظار`;
  const hours = minutes / 60;
  const hoursLabel = hours.toLocaleString("fa-IR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${hoursLabel} ساعت در انتظار`;
}
