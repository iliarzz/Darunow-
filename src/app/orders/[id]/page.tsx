"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FadeSlideIn } from "@/components/motion/fade-slide-in";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OrderStatusStepper } from "@/components/orders/order-status-stepper";
import { formatDate, formatMoney, formatOrderId, formatTime } from "@/lib/format";
import { useConfirm } from "@/components/confirm/useConfirm";
import { useToast } from "@/components/ui/use-toast";
import { syncOrdersFromServer, useOrder, updateOrder } from "@/stores/orders";
import type { OrderStatus, PaymentMethodType } from "@/lib/types-v2";
import { useAddress } from "@/stores/address";
import { getProvinceName, getCityName } from "@/lib/location/iran";
import { StatusPill } from "@/components/orders/status-pill";
import { useReorderAction } from "@/components/orders/useReorderAction";
import { useRatings, saveRating } from "@/stores/ratings";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Star } from "lucide-react";

export default function OrderDetail({ params }: { params: { id: string } }) {
  const order = useOrder(params.id);
  const address = useAddress(order?.addressId);
  const confirm = useConfirm();
  const { toast } = useToast();
  const { reorder, conflictSheet } = useReorderAction();
  const ratings = useRatings();
  const existingRating = ratings.find((r) => r.orderId === order?.id);
  const [cancelReason, setCancelReason] = useState("تغییر تصمیم");
  const [cancelNote, setCancelNote] = useState("");
  const [ratingScore, setRatingScore] = useState(4);
  const [ratingNote, setRatingNote] = useState("");
  const [ratingOpen, setRatingOpen] = useState(false);
  const itemsTotal = order?.subtotal ?? order?.total ?? 0;
  const deliveryFee = order?.deliveryFee ?? 0;
  const [proposals, setProposals] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!order) {
      void syncOrdersFromServer();
    }
  }, [order]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!order) return;
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        const data = await res.json();
        if (data?.proposals) setProposals(data.proposals);
        if (data?.prescriptions) setPrescriptions(data.prescriptions);
      } catch {
        setProposals([]);
        setPrescriptions([]);
      }
    };
    fetchDetail();
  }, [order]);

  if (!order) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">سفارش یافت نشد.</p>
        <Button variant="ghost" asChild>
          <Link href="/orders">بازگشت</Link>
        </Button>
      </div>
    );
  }

  const canCancel: OrderStatus[] = ["created", "rx_received", "rx_review", "preparing"];
  const events = useMemo(
    () => order.timeline.map((t) => ({ status: t.status, at: t.at })),
    [order.timeline],
  );

  const handleCancel = async () => {
    const ok = await confirm({
      title: "لغو سفارش؟",
      description: "لغو سفارش پس از تایید قابل بازگشت نیست.",
      confirmText: "تأیید لغو سفارش",
      cancelText: "انصراف",
      variant: "destructive",
      extra: (
        <div className="space-y-3 pt-2">
          <p className="text-sm font-semibold text-text">دلیل لغو</p>
          <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="grid gap-2">
            {["تغییر تصمیم", "اشتباه ثبت شد", "زمان ارسال طولانی است", "دیگر نیاز ندارم", "سایر"].map((reason) => (
              <label key={reason} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 p-2">
                <RadioGroupItem value={reason} />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </RadioGroup>
          {cancelReason === "سایر" && (
            <div className="space-y-1">
              <Label htmlFor="cancel-note" className="text-xs text-muted">
                توضیح
              </Label>
              <Textarea
                id="cancel-note"
                placeholder="توضیح کوتاه"
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
              />
            </div>
          )}
        </div>
      ),
    });
    if (ok) {
      const note = cancelReason === "سایر" ? cancelNote || cancelReason : cancelReason;
      updateOrder(order.id, { status: "cancelled", notes: note });
      toast({ title: "سفارش لغو شد" });
    }
  };

  const handleRefund = async () => {
    const ok = await confirm({
      title: "درخواست بازگشت وجه؟",
      description: "درخواست شما ثبت می‌شود و بررسی خواهد شد.",
      confirmText: "ثبت درخواست",
      cancelText: "انصراف",
    });
    if (ok) {
      updateOrder(order.id, { status: "refunding" });
      toast({ title: "درخواست ثبت شد", description: "در حال بررسی بازگشت وجه." });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <FadeSlideIn>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text">سفارش {formatOrderId(order.id)}</h1>
          <StatusPill status={order.status} />
        </div>
        <p className="text-sm text-muted">
          تاریخ {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
        </p>
      </FadeSlideIn>
      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <Card className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="mb-3 text-lg font-semibold">وضعیت</h2>
            <div className="flex items-center gap-2">
              {canCancel.includes(order.status) && (
                <Button variant="outline" className="text-danger border-danger/40" onClick={handleCancel}>
                  لغو سفارش
                </Button>
              )}
              {order.status === "delivered" && (
                <Button variant="outline" onClick={handleRefund}>
                  درخواست بازگشت
                </Button>
              )}
              {order.status === "delivered" && !existingRating && (
                <Sheet open={ratingOpen} onOpenChange={setRatingOpen}>
                  <SheetTrigger asChild>
                    <Button variant="secondary">امتیاز بده</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="space-y-4">
                    <SheetHeader>
                      <SheetTitle>امتیاز به این سفارش</SheetTitle>
                      <p className="text-sm text-muted">نظر کوتاه شما به بهبود کیفیت کمک می‌کند.</p>
                    </SheetHeader>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-2"
                          onClick={() => setRatingScore(n)}
                          aria-label={`امتیاز ${n}`}
                        >
                          <Star className={n <= ratingScore ? "h-5 w-5 fill-primary-800 text-primary-800" : "h-5 w-5 text-muted"} />
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted">توضیح (اختیاری)</Label>
                      <Textarea
                        rows={3}
                        value={ratingNote}
                        onChange={(e) => setRatingNote(e.target.value)}
                        placeholder="تجربه خود را بنویس..."
                        className="rounded-2xl"
                      />
                    </div>
                    <Button
                      className="w-full rounded-full"
                      onClick={async () => {
                        await saveRating({
                          orderId: order.id,
                          pharmacyId: order.pharmacyId ?? order.items[0]?.pharmacyId ?? "legacy-pharmacy",
                          score: ratingScore,
                          note: ratingNote || undefined,
                        });
                        toast({ title: "امتیاز ثبت شد" });
                        setRatingOpen(false);
                      }}
                    >
                      ثبت امتیاز
                    </Button>
                  </SheetContent>
                </Sheet>
              )}
              <Button variant="secondary" onClick={() => reorder(order)}>
                تکرار سفارش
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/support/new?orderId=${order.id}`}>پشتیبانی درباره این سفارش</Link>
              </Button>
            </div>
          </div>
          <OrderStatusStepper current={order.status} events={events} />
        </Card>
        <Card className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-soft">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span>
                  {item.name} <span className="text-muted">×{item.qty.toLocaleString("fa-IR")}</span>
                </span>
                <span>{formatMoney(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm text-muted">
              <span>جمع اقلام</span>
              <span>{formatMoney(itemsTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>هزینه ارسال</span>
              <span>{deliveryFee ? formatMoney(deliveryFee) : "رایگان"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>تخفیف</span>
              <span>{order.discount ? `-${formatMoney(order.discount)}` : "۰ تومان"}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold">
              <span>قابل پرداخت</span>
              <span>{formatMoney(order.payable)}</span>
            </div>
            {address && (
              <div className="rounded-xl border border-border/60 bg-card/70 p-3 text-xs text-text/80">
                <p className="font-semibold">آدرس تحویل</p>
                <p className="text-muted">
                  {getProvinceName(address.province)}، {getCityName(address.city)}
                </p>
                <p>{[address.line1, address.line2].filter(Boolean).join(" · ")}</p>
              </div>
            )}
            <div className="rounded-xl border border-dashed border-border/60 bg-card/70 p-3 text-xs text-text/80">
              <p>پرداخت: {translatePayment(order.paymentType)}</p>
              <p>جایگزینی: {translateSubstitution(order.substitution)}</p>
            </div>
            {prescriptions.length > 0 && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-3 text-xs text-text/80">
                <p className="text-sm font-semibold">نسخه</p>
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2">
                    <div>
                      <p className="text-xs font-semibold text-text">وضعیت نسخه</p>
                      <p className="text-[11px] text-muted">{rx.fileType || "فایل ثبت شده"}</p>
                    </div>
                    <Badge variant="outline">{translateRxStatus(rx.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
            {proposals.length > 0 && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-3 text-xs text-text/80">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">پیشنهاد جایگزین</p>
                  <Badge variant="outline">{translateProposalStatus(proposals[0].status)}</Badge>
                </div>
                {proposals.map((p) => {
                  const items = Array.isArray(p.items) ? p.items : [];
                  const isPending = p.status === "pending";
                  return (
                    <div key={p.id} className="space-y-2 rounded-lg border border-border/50 p-2">
                      {items.length === 0 && <p className="text-xs text-muted">جزئیات پیشنهاد ثبت نشده است.</p>}
                      {items.map((it: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-2/60 p-2"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{it.proposedName ?? it.originalName}</p>
                            <p className="text-[11px] text-muted">اصلی: {it.originalName ?? "-"}</p>
                          </div>
                          <Badge variant="neutral">
                            {it.priceDelta > 0
                              ? `+${formatMoney(it.priceDelta)}`
                              : it.priceDelta < 0
                                ? formatMoney(it.priceDelta)
                                : "بدون تغییر"}
                          </Badge>
                        </div>
                      ))}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted">وضعیت: {translateProposalStatus(p.status)}</span>
                        {isPending ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => respondSubstitution(p.id, "accepted")}>
                              تایید
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => respondSubstitution(p.id, "rejected")}>
                              رد
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline">{translateProposalStatus(p.status)}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
      {conflictSheet}
    </div>
  );

  async function respondSubstitution(id: string, decision: "accepted" | "rejected") {
    await fetch(`/api/substitution/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    toast({ title: decision === "accepted" ? "تایید شد" : "رد شد" });
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status: decision } : p)));
  }
}

function translatePayment(type: PaymentMethodType | undefined) {
  if (type === "cod") return "پرداخت در محل";
  if (type === "card") return "کارت ذخیره شده";
  return "پرداخت آنلاین";
}

function translateRxStatus(status: string) {
  switch (status) {
    case "approved":
      return "تایید شده";
    case "needs_fix":
      return "نیاز به اصلاح";
    case "review":
      return "در حال بررسی";
    case "received":
      return "دریافت شد";
    default:
      return status;
  }
}

function translateProposalStatus(status: string) {
  switch (status) {
    case "pending":
      return "در انتظار تایید";
    case "accepted":
      return "تایید شد";
    case "rejected":
      return "رد شد";
    default:
      return status;
  }
}

function translateSubstitution(pref: string) {
  switch (pref) {
    case "none":
      return "جایگزین نشود";
    case "similarAllowed":
      return "مشابه پیشنهاد شود";
    case "askMe":
      return "فقط با تایید من";
    default:
      return pref;
  }
}
