"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressPickerSheet } from "@/components/features/AddressPickerSheet";
import { formatMoney } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import { useCartItems, cartTotal, cartWithDetails, clearCart } from "@/stores/cart";
import { useAddresses, setDefaultAddress } from "@/stores/address";
import { useAppliedCoupon, applyCoupon, clearCoupon } from "@/stores/coupons";
import { useCheckoutPrefs, setPreferredDeliveryType, setSubstitutionPreference } from "@/stores/checkout-prefs";
import { createPayment, setDefaultPayment, usePayments } from "@/stores/payment";
import { setSelectedSlot, useSelectedSlot } from "@/stores/delivery-slots";
import { Input } from "@/components/ui/input";
import type { AppliedCoupon, PaymentMethodType } from "@/lib/types-v2";
import { createOrder } from "@/stores/orders";
import { useCheckoutSession, updateCheckoutSession, clearCheckoutSession } from "@/stores/checkout-session";
import { useHydrated } from "@/lib/useHydrated";
import { track } from "@/lib/track";

const deliverySlots = [
  { id: "express", label: "ارسال فوری", eta: "۳۰-۵۰ دقیقه", fee: 0, type: "express" as const },
  { id: "scheduled-am", label: "امروز - ۱۰ تا ۱۴", eta: "ظهر", fee: 15000, type: "scheduled" as const },
  { id: "scheduled-pm", label: "امروز - ۱۶ تا ۲۰", eta: "عصر", fee: 15000, type: "scheduled" as const },
];

const substitutionOptions = [
  { id: "none", label: "جایگزین نشود", desc: "اقلام موجود ارسال می‌شود." },
  { id: "similarAllowed", label: "مشابه پیشنهاد شود", desc: "داروخانه مشابه نزدیک را جایگزین می‌کند." },
  { id: "askMe", label: "فقط با تأیید من", desc: "قبل از جایگزینی تماس گرفته می‌شود." },
];

type CouponCode = "WELCOME10" | "DARU50";
const couponRules: Record<CouponCode, AppliedCoupon> = {
  WELCOME10: { discountType: "percent", value: 10, code: "WELCOME10" },
  DARU50: { discountType: "fixed", value: 50000, code: "DARU50" },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const items = useCartItems();
  const lines = useMemo(() => cartWithDetails(items), [items]);
  const addresses = useAddresses();
  const payments = usePayments();
  const prefs = useCheckoutPrefs();
  const appliedCoupon = useAppliedCoupon();
  const selectedSlotState = useSelectedSlot();
  const { toast } = useToast();
  const session = useCheckoutSession();
  const hydrated = useHydrated();

  const subtotal = useMemo(() => cartTotal(items), [items]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(session.selectedAddressId);
  const [selectedSlot, setSelectedSlotLocal] = useState<string>(session.selectedSlotId ?? selectedSlotState.selectedId ?? "express");
  const [paymentMethodId, setPaymentMethodId] = useState<string | undefined>(session.selectedPaymentId);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const defaultAddress = session.selectedAddressId ?? addresses.find((a) => a.isDefault)?.id;
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress);
    }
  }, [addresses, hydrated, selectedAddressId, session.selectedAddressId]);

  useEffect(() => {
    if (!hydrated) return;
    const defaultPayment = session.selectedPaymentId ?? payments.find((p) => p.isDefault)?.id;
    if (!paymentMethodId && defaultPayment) {
      setPaymentMethodId(defaultPayment);
    }
  }, [hydrated, paymentMethodId, payments, session.selectedPaymentId]);

  useEffect(() => {
    if (!hydrated) return;
    if (session.selectedSlotId && session.selectedSlotId !== selectedSlot) {
      setSelectedSlotLocal(session.selectedSlotId);
      setSelectedSlot(session.selectedSlotId);
    }
  }, [hydrated, selectedSlot, session.selectedSlotId]);

  useEffect(() => {
    if (!hydrated) return;
    if (session.substitutionPref && session.substitutionPref !== prefs.substitution) {
      setSubstitutionPreference(session.substitutionPref);
    }
  }, [hydrated, prefs.substitution, session.substitutionPref]);

  useEffect(() => {
    if (!hydrated) return;
    if (session.appliedCoupon && !appliedCoupon) {
      applyCoupon(session.appliedCoupon);
    }
    if (!session.appliedCoupon && appliedCoupon) {
      updateCheckoutSession({ appliedCoupon: appliedCoupon });
    }
  }, [appliedCoupon, hydrated, session.appliedCoupon]);

  useEffect(() => {
    if (!hydrated) return;
    updateCheckoutSession({
      selectedAddressId,
      selectedPaymentId: paymentMethodId,
      selectedSlotId: selectedSlot,
      slotType: deliverySlots.find((s) => s.id === selectedSlot)?.type ?? session.slotType ?? "express",
      substitutionPref: prefs.substitution,
      appliedCoupon,
    });
  }, [hydrated, selectedAddressId, paymentMethodId, selectedSlot, prefs.substitution, appliedCoupon, session.slotType]);

  useEffect(() => {
    if (!hydrated || !items.length) return;
    track("checkout_started", { itemCount: items.length, subtotal });
  }, [hydrated, items.length, subtotal]);

  const slotFee = deliverySlots.find((s) => s.id === selectedSlot)?.fee ?? 0;
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percent"
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;
  const payableBefore = subtotal + slotFee;
  const payable = Math.max(0, payableBefore - discount);

  const selectedAddress = selectedAddressId ? addresses.find((a) => a.id === selectedAddressId) : undefined;
  const selectedPayment = paymentMethodId
    ? payments.find((p) => p.id === paymentMethodId)
    : payments.find((p) => p.isDefault);
  const canSubmit = Boolean(items.length && selectedAddress && selectedSlot && selectedPayment);
  const missingHints = [
    !selectedAddress ? "آدرس تحویل را انتخاب کن." : null,
    !selectedPayment ? "روش پرداخت را مشخص کن." : null,
  ].filter(Boolean);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === "WELCOME10" || code === "DARU50") {
      const coupon = couponRules[code as CouponCode];
      applyCoupon(coupon);
      updateCheckoutSession({ appliedCoupon: coupon });
      setCouponError(null);
      toast({ title: "کد تخفیف اعمال شد." });
    } else {
      setCouponError("کد نامعتبر است.");
      clearCoupon();
      updateCheckoutSession({ appliedCoupon: undefined });
    }
  };

  const ensurePayment = () => {
    if (selectedPayment) return selectedPayment;
    const online = createPayment({
      type: "online",
      label: "پرداخت آنلاین",
      isDefault: true,
    });
    setPaymentMethodId(online.id);
    updateCheckoutSession({ selectedPaymentId: online.id });
    return online;
  };

  const placeOrder = () => {
    if (!items.length) {
      toast({ title: "سبد خالی است", description: "ابتدا محصول یا نسخه اضافه کن." });
      return;
    }
    if (!selectedAddress) {
      toast({ title: "آدرس لازم است", description: "لطفا آدرس تحویل را انتخاب کن." });
      return;
    }
    const payment = ensurePayment();
    setDefaultAddress(selectedAddress.id);
    setDefaultPayment(payment.id);
    const pharmacyId = items[0]?.pharmacyId ?? lines[0]?.pharmacy?.id;
    const order = createOrder({
      status: "preparing",
      pharmacyId,
      items: lines.map(({ item }) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        productId: item.id,
        pharmacyId: item.pharmacyId,
        subtitle: item.subtitle,
      })),
      total: payableBefore,
      discount,
      payable,
      addressId: selectedAddress.id,
      deliverySlotId: selectedSlot,
      paymentType: payment.type as PaymentMethodType,
      substitution: prefs.substitution,
    });
    clearCart();
    clearCoupon();
    clearCheckoutSession();
    track("order_submitted", { orderId: order.id, payable });
    toast({ title: "سفارش ثبت شد", description: "برای پیگیری به صفحه سفارش‌ها منتقل می‌شوی." });
    router.push(`/orders/success?orderId=${order.id}`);
  };

  if (!items.length) {
    return (
      <EmptyState
        title="سبد خالی است."
        description="ابتدا محصول یا نسخه اضافه کن."
        action={{ label: "بازگشت به خانه", href: "/" }}
      />
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text">تایید و پرداخت</h1>
        <p className="text-sm text-muted">تحویل، زمان، پرداخت و تخفیف را تعیین کن.</p>
      </div>

  <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">آدرس تحویل</p>
            <p className="text-base font-semibold text-text">{selectedAddress?.recipientName ?? "انتخاب نشده"}</p>
            {selectedAddress ? (
              <p className="text-sm text-muted">
                {selectedAddress.city}، {selectedAddress.province} — {[selectedAddress.line1, selectedAddress.line2].filter(Boolean).join(" · ")}
              </p>
            ) : (
              <p className="text-xs text-warning">آدرس انتخاب نشده است.</p>
            )}
          </div>
          <AddressPickerSheet selectedId={selectedAddressId} onSelect={(id) => setSelectedAddressId(id)}>
            <Button variant="outline" size="sm">
              تغییر
            </Button>
          </AddressPickerSheet>
        </div>
        {!addresses.length && (
          <EmptyState
            title="آدرسی ثبت نشده."
            description="برای تکمیل سفارش لازم است."
            action={{ label: "افزودن آدرس جدید", href: "/profile/addresses/new" }}
          />
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text">زمان تحویل</p>
          <Badge variant="outline">آرام و سریع</Badge>
        </div>
        <div className="grid gap-2">
          {deliverySlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                setSelectedSlotLocal(slot.id);
                setSelectedSlot(slot.id);
                setPreferredDeliveryType(slot.type);
              }}
              className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-right transition ${
                selectedSlot === slot.id ? "border-brand bg-accent-200/30" : "border-border bg-surface-1"
              }`}
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text">{slot.label}</p>
                <p className="text-xs text-muted">{slot.eta}</p>
              </div>
              <div className="text-sm font-semibold text-text">{slot.fee ? formatMoney(slot.fee) : "رایگان"}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text">پرداخت</p>
          <Badge variant="outline">امن</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {payments.map((p) => (
            <Chip key={p.id} selected={paymentMethodId === p.id} onClick={() => setPaymentMethodId(p.id)}>
              {p.label}
            </Chip>
          ))}
          {payments.length === 0 && (
            <Chip selected onClick={() => setPaymentMethodId(ensurePayment().id)}>
              پرداخت آنلاین
            </Chip>
          )}
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/profile/payments/new">روش جدید</Link>
          </Button>
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-semibold text-text">جانشینی اقلام</p>
        <div className="grid gap-2">
          {substitutionOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSubstitutionPreference(opt.id as any)}
              className={`w-full rounded-2xl border px-3 py-3 text-right transition ${
                prefs.substitution === opt.id ? "border-brand bg-accent-200/30" : "border-border bg-surface-1"
              }`}
            >
              <p className="text-sm font-semibold text-text">{opt.label}</p>
              <p className="text-xs text-muted">{opt.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text">کد تخفیف</p>
          {appliedCoupon && <Badge variant="success">{appliedCoupon.code}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="flex-1 rounded-full"
            placeholder="کد تخفیف"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
          />
          <Button variant="primary" size="sm" onClick={handleApplyCoupon}>
            اعمال
          </Button>
          {appliedCoupon && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearCoupon();
                updateCheckoutSession({ appliedCoupon: undefined });
              }}
            >
              حذف
            </Button>
          )}
        </div>
        {couponError && <p className="text-xs text-danger">{couponError}</p>}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text">خلاصه مبلغ</p>
          <Badge variant="outline">{lines.length} قلم</Badge>
        </div>
        <div className="space-y-2 text-sm">
          {lines.map(({ item }) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-text">
                {item.name} <span className="text-muted">×{item.qty.toLocaleString("fa-IR")}</span>
              </span>
              <span className="font-semibold text-text">{formatMoney(item.price * item.qty)}</span>
            </div>
          ))}
          <Row label="جمع اقلام" value={formatMoney(subtotal)} />
          <Row label="هزینه ارسال" value={slotFee ? formatMoney(slotFee) : "رایگان"} />
          <Row label="تخفیف" value={discount ? `-${formatMoney(discount)}` : "۰ تومان"} />
        </div>
        <div className="flex items-center justify-between border-top border-t border-border pt-3 text-base font-bold text-text">
          <span>مبلغ پرداخت</span>
          <span>{formatMoney(payable)}</span>
        </div>
        <Button className="w-full rounded-full" onClick={placeOrder} disabled={!canSubmit}>
          ثبت سفارش
        </Button>
        {!canSubmit && (
          <div className="space-y-1 rounded-[12px] bg-surface-2 px-3 py-2 text-xs text-muted">
            {missingHints.map((hint) => (
              <p key={hint}>{hint}</p>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>شرایط جانشینی: {substitutionOptions.find((o) => o.id === prefs.substitution)?.label}</span>
          <Link href="/prescriptions/new" className="text-brand underline underline-offset-4">
            افزودن نسخه
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-text">{value}</span>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="space-y-4 pb-16">
      <Skeleton className="h-6 w-32 rounded-full" />
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="space-y-3 p-4">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-5/6 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
