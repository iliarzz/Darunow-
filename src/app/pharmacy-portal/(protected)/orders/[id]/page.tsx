"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { InfoChip } from "@/components/ui/InfoChip";
import { Stepper } from "@/components/ui/stepper";
import { StatusPill } from "@/components/orders/status-pill";
import { portalApi } from "@/lib/portal/api";
import { formatDate, formatMoney, formatOrderId, formatTime } from "@/lib/format";
import { nextStatuses } from "@/lib/orders/status";
import type { Order, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUS_META } from "@/constants/status";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Clock3, MapPin, Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const etaPresets = [20, 30, 45, 60, 75];
const rejectPresets = ["ناموجود", "نیاز به نسخه فیزیکی", "محدودیت ارسال به آدرس", "سفارش تکراری"];
const statusFlow: OrderStatus[] = ["PLACED", "PHARMACY_REVIEW", "PHARMACY_ACCEPTED", "PREPARING", "READY_FOR_DISPATCH", "DISPATCHED", "DELIVERED"];
const rxTemplates = ["نسخه واضح‌تر ارسال شود.", "داروی جایگزین تایید شود.", "ارسال کد رهگیری نسخه در پیام.", "به شرط موجودی داروخانه تایید می‌شود."];
const paymentMethodLabels: Record<string, string> = {
  ONLINE_SHAPARAK: "پرداخت آنلاین",
  COD_CARD_READER: "کارتخوان حضوری",
  CARD_TO_CARD: "کارت به کارت",
  online_shaparak: "پرداخت آنلاین",
  cod_card_reader: "کارتخوان حضوری",
  card_to_card: "کارت به کارت",
};
const paymentStatusLabels: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  SUCCESS: "پرداخت موفق",
  FAILED: "ناموفق",
  COD: "پرداخت در محل",
};

export default function PortalOrderDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(45);
  const [rejectReason, setRejectReason] = useState("ناموجود");
  const [rxNote, setRxNote] = useState("");
  const [proposalNote, setProposalNote] = useState("");
  const [proposal, setProposal] = useState({ originalItemId: "", suggestedName: "", suggestedUnitPrice: "" });
  const [nextOrderId, setNextOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ open: boolean; image?: string; zoom: number; rotate: number }>({ open: false, zoom: 1, rotate: 0 });

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalApi.getOrder(params.id);
      setOrder(data);
      setEtaMinutes(data.etaMinutes ?? 45);
      setRejectReason(data.internalNote || "ناموجود");
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری سفارش با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const loadNextOrder = useCallback(async () => {
    try {
      const list = await portalApi.listOrders();
      const idx = list.findIndex((o) => o.id === params.id);
      if (idx >= 0 && idx < list.length - 1) {
        setNextOrderId(list[idx + 1].id);
      } else {
        setNextOrderId(null);
      }
    } catch {
      setNextOrderId(null);
    }
  }, [params.id]);

  useEffect(() => {
    void loadNextOrder();
  }, [loadNextOrder, order?.status]);

  const availableNext = useMemo(() => (order ? nextStatuses(order.status) : []), [order]);

  const handleAccept = useCallback(async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await portalApi.acceptOrder(order.id, etaMinutes);
      setOrder(updated);
      toast({ title: "تایید شد", description: `ETA ${etaMinutes} دقیقه ثبت شد.` });
    } catch (err) {
      toast({ title: "خطا در تایید", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }, [etaMinutes, order, toast]);

  const handleReject = useCallback(async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const updated = await portalApi.rejectOrder(order.id, rejectReason || "عدم امکان تامین");
      setOrder(updated);
      toast({ title: "سفارش رد شد" });
    } catch (err) {
      toast({ title: "خطا در رد", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }, [order, rejectReason, toast]);

  const handleStatus = useCallback(
    async (nextStatus: OrderStatus) => {
      if (!order) return;
      if (!availableNext.includes(nextStatus)) return;
      setActionLoading(true);
      try {
        const updated = await portalApi.updateStatus(order.id, nextStatus);
        setOrder(updated);
        toast({ title: "وضعیت بروزرسانی شد" });
      } catch (err) {
        toast({ title: "خطا در بروزرسانی", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
      } finally {
        setActionLoading(false);
      }
    },
    [availableNext, order, toast],
  );

  const handlePrescription = useCallback(
    async (reviewStatus: "APPROVED" | "NEED_CLARIFICATION" | "REJECTED") => {
      if (!order) return;
      setActionLoading(true);
      try {
        const updated = await portalApi.reviewPrescription(order.id, reviewStatus, rxNote || undefined);
        setOrder(updated);
        toast({ title: "وضعیت نسخه ثبت شد" });
      } catch (err) {
        toast({ title: "خطا در نسخه", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
      } finally {
        setActionLoading(false);
      }
    },
    [order, rxNote, toast],
  );

  const handleProposal = useCallback(async () => {
    if (!order) return;
    if (!proposal.originalItemId || !proposal.suggestedName || !proposal.suggestedUnitPrice) {
      toast({ title: "اطلاعات جایگزین کامل نیست", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      const updated = await portalApi.saveSubstitution(order.id, {
        originalItemId: proposal.originalItemId,
        suggestedName: proposal.suggestedName,
        suggestedUnitPrice: Number(proposal.suggestedUnitPrice),
        reason: proposalNote || undefined,
      });
      setOrder(updated);
      setProposal({ originalItemId: "", suggestedName: "", suggestedUnitPrice: "" });
      setProposalNote("");
      toast({ title: "پیشنهاد جایگزین ثبت شد" });
    } catch (err) {
      toast({ title: "خطا در ثبت پیشنهاد", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }, [order, proposal, proposalNote, toast]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || (target as HTMLElement | null)?.isContentEditable;
      if (typing) return;
      if (event.key.toLowerCase() === "a") {
        event.preventDefault();
        void handleAccept();
      }
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        void handleReject();
      }
      if (event.key.toLowerCase() === "n" && nextOrderId) {
        event.preventDefault();
        router.push(`/pharmacy-portal/orders/${nextOrderId}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAccept, handleReject, nextOrderId, router]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return <ErrorState title="خطا در بارگذاری سفارش" description="دسترسی به سفارش ممکن نشد." details={error} onRetry={() => loadOrder()} />;
  }

  if (!order) {
    return <EmptyState title="سفارش پیدا نشد" action={{ label: "بازگشت به سفارش‌ها", href: "/pharmacy-portal/orders" }} />;
  }

  const waitingLabel = formatWait(order.createdAt);
  const paymentLabel = `${paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod} • ${paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}`;

  return (
    <div className="space-y-4 pb-16">
      <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted">
              سفارش <span className="ltr inline-flex">{formatOrderId(order.id)}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-primary-900">{order.customerName}</h1>
              <StatusPill status={order.status} className="rounded-full px-3 py-[6px] text-[12px]" />
              <Badge variant="outline" className="rounded-full px-2 py-[4px] text-[11px]">
                {order.type === "PRESCRIPTION" ? "نسخه" : "سفارش"}
              </Badge>
              <Badge variant="neutral" className="rounded-full px-2 py-[4px] text-[11px]">
                {order.items.length} قلم
              </Badge>
            </div>
            <p className="text-[12px] text-muted">
              {formatDate(order.createdAt)} • {formatTime(order.createdAt)} • {waitingLabel}
            </p>
          </div>
          <div className="space-y-1 text-end">
            <p className="text-sm text-muted">مبلغ کل</p>
            <p className="text-xl font-bold text-primary-900">{formatMoney(order.total)}</p>
            {order.etaMinutes && <p className="text-[12px] text-muted">ETA: {order.etaMinutes} دقیقه</p>}
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <InfoRow label="پرداخت" value={paymentLabel} />
          <InfoRow label="آدرس تحویل" value={order.deliveryAddressText} />
          <InfoRow label="تماس" value={order.customerPhoneMasked ?? order.customerPhone ?? "ثبت نشده"} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.45fr,0.9fr]">
        <div className="space-y-4">
          <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary-900">اطلاعات تحویل</p>
                <p className="text-[12px] text-muted">{order.deliveryAddressText}</p>
                {order.internalNote && <p className="text-[12px] text-warning">یادداشت: {order.internalNote}</p>}
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                {order.pharmacyName}
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoRow label="زمان آماده‌سازی" value={order.etaMinutes ? `${order.etaMinutes} دقیقه` : "تعیین نشده"} />
              <InfoRow label="نوع سفارش" value={order.type === "PRESCRIPTION" ? "نسخه" : "سفارش"} />
            </div>
          </Card>

          <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-primary-900">اقلام سفارش</p>
              <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
                {order.items.length} قلم
              </Badge>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-divider bg-surface-2 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-primary-900">{item.name}</p>
                    {item.requiresPrescription && (
                      <Badge variant="warning" className="mt-1 w-fit rounded-full px-2 py-[2px] text-[11px]">
                        نیازمند نسخه
                      </Badge>
                    )}
                  </div>
                  <div className="text-end text-sm text-primary-900">
                    <p className="font-semibold">{formatMoney(item.unitPrice * item.qty)}</p>
                    <p className="text-[12px] text-muted">×{item.qty.toLocaleString("fa-IR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {order.prescription && (
            <PrescriptionSection
              prescription={order.prescription}
              rxNote={rxNote}
              setRxNote={setRxNote}
              onAction={handlePrescription}
              actionLoading={actionLoading}
              onTemplate={(text) => setRxNote(text)}
              viewer={viewer}
              setViewer={setViewer}
            />
          )}

          <SubstitutionSection
            order={order}
            proposal={proposal}
            setProposal={setProposal}
            proposalNote={proposalNote}
            setProposalNote={setProposalNote}
            onSubmit={handleProposal}
            actionLoading={actionLoading}
          />

          <AuditLogSection order={order} />
        </div>

        <aside className="space-y-3 lg:sticky lg:top-28">
          <ActionRail
            order={order}
            etaMinutes={etaMinutes}
            setEtaMinutes={setEtaMinutes}
            handleAccept={handleAccept}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            handleReject={handleReject}
            availableNext={availableNext}
            handleStatus={handleStatus}
            nextOrderId={nextOrderId}
            goNext={nextOrderId ? () => router.push(`/pharmacy-portal/orders/${nextOrderId}`) : undefined}
            actionLoading={actionLoading}
            waitingLabel={waitingLabel}
          />

          <StatusStepper order={order} />
        </aside>
      </div>
    </div>
  );
}

function ActionRail({
  order,
  etaMinutes,
  setEtaMinutes,
  handleAccept,
  rejectReason,
  setRejectReason,
  handleReject,
  availableNext,
  handleStatus,
  nextOrderId,
  goNext,
  actionLoading,
  waitingLabel,
}: {
  order: Order;
  etaMinutes: number;
  setEtaMinutes: (v: number) => void;
  handleAccept: () => void;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  handleReject: () => void;
  availableNext: OrderStatus[];
  handleStatus: (s: OrderStatus) => void;
  nextOrderId: string | null;
  goNext?: () => void;
  actionLoading: boolean;
  waitingLabel: string;
}) {
  return (
    <Card className="space-y-4 rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted">اقدامات سریع</p>
          <p className="text-lg font-bold text-primary-900">{order.customerName}</p>
        </div>
        <InfoChip>{waitingLabel}</InfoChip>
      </div>

      <div className="space-y-2 rounded-xl border border-divider bg-surface-2/90 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary-900">زمان آماده‌سازی</p>
          <Badge variant="neutral" className="rounded-full px-3 py-[4px] text-[11px]">
            کلید A
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {etaPresets.map((m) => (
            <Chip key={m} selected={etaMinutes === m} onClick={() => setEtaMinutes(m)}>
              {m} دقیقه
            </Chip>
          ))}
          <Input
            type="number"
            value={etaMinutes}
            onChange={(e) => setEtaMinutes(Number(e.target.value))}
            className="h-10 w-24 rounded-full border-divider bg-surface-1 text-center"
          />
        </div>
        <Button onClick={handleAccept} disabled={actionLoading} className="w-full rounded-full">
          تایید سفارش
        </Button>
      </div>

      <div className="space-y-2 rounded-xl border border-divider bg-surface-2/90 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary-900">رد سفارش</p>
          <Badge variant="neutral" className="rounded-full px-3 py-[4px] text-[11px]">
            کلید R
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rejectPresets.map((reason) => (
            <Chip key={reason} selected={rejectReason === reason} onClick={() => setRejectReason(reason)}>
              {reason}
            </Chip>
          ))}
        </div>
        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="توضیح کوتاه" />
        <Button variant="ghost" onClick={handleReject} disabled={actionLoading} className="w-full rounded-full">
          رد سفارش
        </Button>
      </div>

      {availableNext.length > 0 && (
        <div className="space-y-2 rounded-xl border border-divider bg-surface-2/90 p-3">
          <p className="text-sm font-semibold text-primary-900">تغییر وضعیت</p>
          <div className="flex flex-wrap gap-2">
            {availableNext.map((status) => (
              <Button
                key={status}
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={actionLoading}
                onClick={() => handleStatus(status)}
              >
                {ORDER_STATUS_META[status]?.label ?? status}
              </Button>
            ))}
          </div>
        </div>
      )}

      {nextOrderId && goNext && (
        <Button variant="secondary" className="w-full rounded-full" onClick={goNext}>
          سفارش بعدی (N)
        </Button>
      )}
    </Card>
  );
}

function PrescriptionSection({
  prescription,
  rxNote,
  setRxNote,
  onAction,
  actionLoading,
  onTemplate,
  viewer,
  setViewer,
}: {
  prescription: NonNullable<Order["prescription"]>;
  rxNote: string;
  setRxNote: (v: string) => void;
  onAction: (status: "APPROVED" | "NEED_CLARIFICATION" | "REJECTED") => void;
  actionLoading: boolean;
  onTemplate: (v: string) => void;
  viewer: { open: boolean; image?: string; zoom: number; rotate: number };
  setViewer: (v: { open: boolean; image?: string; zoom: number; rotate: number }) => void;
}) {
  const activeImage = viewer.image || prescription.imageUrls[0];
  return (
    <Card className="space-y-4 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary-900">بررسی نسخه</p>
        <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
          {prescription.reviewStatus ?? "PENDING_REVIEW"}
        </Badge>
      </div>
      <PrescriptionViewer images={prescription.imageUrls} viewer={viewer} setViewer={setViewer} activeImage={activeImage} />
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary-900">الگوی سریع</p>
        <div className="flex flex-wrap gap-2">
          {rxTemplates.map((tpl) => (
            <Chip key={tpl} onClick={() => onTemplate(tpl)} selected={rxNote === tpl}>
              {tpl}
            </Chip>
          ))}
        </div>
      </div>
      <Textarea value={rxNote} onChange={(e) => setRxNote(e.target.value)} placeholder="یادداشت برای کاربر یا پشتیبانی" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => onAction("NEED_CLARIFICATION")} disabled={actionLoading} className="rounded-full">
          نیاز به توضیح
        </Button>
        <Button variant="secondary" onClick={() => onAction("APPROVED")} disabled={actionLoading} className="rounded-full">
          تایید نسخه
        </Button>
        <Button variant="ghost" onClick={() => onAction("REJECTED")} disabled={actionLoading} className="rounded-full">
          رد نسخه
        </Button>
      </div>
    </Card>
  );
}

function PrescriptionViewer({
  images,
  activeImage,
  viewer,
  setViewer,
}: {
  images: string[];
  activeImage?: string;
  viewer: { open: boolean; image?: string; zoom: number; rotate: number };
  setViewer: (v: { open: boolean; image?: string; zoom: number; rotate: number }) => void;
}) {
  const current = activeImage ?? images[0];
  const zoom = viewer.zoom || 1;
  const rotate = viewer.rotate || 0;
  return (
    <>
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl border border-divider bg-surface-2 p-2">
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-lg bg-surface-1">
            {current && (
              <img
                src={current}
                alt="Prescription"
                className="max-h-full max-w-full object-contain transition-transform"
                style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
              />
            )}
          </div>
          <div className="absolute right-2 top-2 flex gap-1">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setViewer({ ...viewer, zoom: Math.min(zoom + 0.2, 3) })}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setViewer({ ...viewer, zoom: Math.max(1, zoom - 0.2) })}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setViewer({ ...viewer, rotate: rotate + 90 })}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setViewer({ ...viewer, open: true, image: current })}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <button
              key={img}
              type="button"
              className={cn(
                "h-16 w-20 overflow-hidden rounded-lg border border-divider bg-surface-2 transition",
                img === current && "ring-2 ring-primary-500",
              )}
              onClick={() => setViewer({ ...viewer, image: img })}
            >
              <img src={img} alt="mini" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      <Dialog
        open={viewer.open}
        onOpenChange={(open) => setViewer({ ...viewer, open })}
      >
        <DialogContent className="max-w-5xl">
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
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubstitutionSection({
  order,
  proposal,
  setProposal,
  proposalNote,
  setProposalNote,
  onSubmit,
  actionLoading,
}: {
  order: Order;
  proposal: { originalItemId: string; suggestedName: string; suggestedUnitPrice: string };
  setProposal: (v: { originalItemId: string; suggestedName: string; suggestedUnitPrice: string }) => void;
  proposalNote: string;
  setProposalNote: (v: string) => void;
  onSubmit: () => void;
  actionLoading: boolean;
}) {
  return (
    <Card className="space-y-4 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary-900">پیشنهاد جایگزین</p>
        <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
          اختیاری
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2 space-y-2">
          <Label>قلم اصلی</Label>
          <select
            value={proposal.originalItemId}
            onChange={(e) => setProposal({ ...proposal, originalItemId: e.target.value })}
            className="w-full rounded-xl border border-divider bg-surface-2 px-3 py-2 text-sm"
          >
            <option value="">انتخاب کنید</option>
            {order.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>نام جایگزین</Label>
          <Input
            value={proposal.suggestedName}
            onChange={(e) => setProposal({ ...proposal, suggestedName: e.target.value })}
            placeholder="نام محصول"
            className="rounded-xl border-divider bg-surface-2/70"
          />
        </div>
        <div className="space-y-2">
          <Label>قیمت پیشنهادی</Label>
          <Input
            type="number"
            value={proposal.suggestedUnitPrice}
            onChange={(e) => setProposal({ ...proposal, suggestedUnitPrice: e.target.value })}
            placeholder="مثلا 120000"
            className="rounded-xl border-divider bg-surface-2/70"
          />
        </div>
        <div className="sm:col-span-4 space-y-2">
          <Label>توضیح</Label>
          <Textarea value={proposalNote} onChange={(e) => setProposalNote(e.target.value)} placeholder="دلیل یا توضیح برای مشتری" />
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <Button onClick={onSubmit} disabled={actionLoading} className="rounded-full">
            ثبت پیشنهاد
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {order.substitutions.length === 0 && <p className="text-sm text-muted">پیشنهادی ثبت نشده است.</p>}
        {order.substitutions.map((sub) => {
          const original = order.items.find((item) => item.id === sub.originalItemId);
          return (
            <div key={sub.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-divider bg-surface-2 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-primary-900">{sub.suggestedName}</p>
                <p className="text-[12px] text-muted">
                  جایگزین برای: {original?.name ?? sub.originalItemId} • {formatMoney(sub.suggestedUnitPrice)}
                </p>
                {sub.reason && <p className="text-[12px] text-muted">دلیل: {sub.reason}</p>}
              </div>
              <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
                {sub.status ?? "DRAFT"}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AuditLogSection({ order }: { order: Order }) {
  return (
    <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary-900">سابقه عملیات</p>
        <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
          Audit Log
        </Badge>
      </div>
      <div className="space-y-2">
        {order.audit.length === 0 && <p className="text-sm text-muted">رکوردی نیست.</p>}
        {order.audit.map((ev) => (
          <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-divider bg-surface-2 px-3 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-200/60 text-primary-800">
              <span className="text-[12px] font-semibold">{formatTime(ev.at)}</span>
            </div>
            <div className="space-y-[2px]">
              <p className="text-sm font-semibold text-primary-900">{ev.action}</p>
              <p className="text-[12px] text-muted">
                {ev.actorName} • {formatDate(ev.at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StatusStepper({ order }: { order: Order }) {
  const steps = useMemo(() => {
    if (order.status === "CANCELED" || order.status === "PHARMACY_REJECTED") {
      return [
        { title: "ثبت سفارش", state: "completed" as const },
        { title: "لغو/رد", state: "active" as const, description: order.internalNote },
      ];
    }
    const currentIndex = statusFlow.indexOf(order.status);
    return statusFlow.map((status, idx) => {
      const meta = ORDER_STATUS_META[status];
      const state = idx < currentIndex ? "completed" : idx === currentIndex ? "active" : "pending";
      return { title: meta?.label ?? status, state, description: meta?.tone === "warning" ? "نیازمند اقدام" : undefined };
    });
  }, [order.internalNote, order.status]);

  return (
    <Card className="rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
      <p className="mb-2 text-sm font-semibold text-primary-900">گردش وضعیت</p>
      <Stepper steps={steps} />
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-divider bg-surface-2 px-3 py-2">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="text-sm font-semibold text-primary-900">{value ?? "نامشخص"}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 pb-16">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-[1.45fr,0.9fr]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function formatWait(createdAt: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - createdAt) / 60000));
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه در انتظار`;
  const hours = minutes / 60;
  return `${hours.toFixed(1).toLocaleString("fa-IR")} ساعت در انتظار`;
}
