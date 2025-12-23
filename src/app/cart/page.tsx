"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeSlideIn } from "@/components/motion/fade-slide-in";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney, formatNumber } from "@/lib/format";
import { cartTotal, groupCartByPharmacy, removeFromCart, setItemQty, useCartItems } from "@/stores/cart";
import { getCartProducts } from "@/lib/cart";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const items = useCartItems();
  const grouped = groupCartByPharmacy(items);
  const subtotal = cartTotal(items);
  const entries = getCartProducts(items);
  const needsRx = entries.some((entry) => entry.product.rxRequired);

  return (
    <div className="space-y-6 pb-12">
      <FadeSlideIn>
        <div className="space-y-1">
          <h1 className="text-[20px] font-bold text-primary-900">سبد خرید</h1>
          <p className="text-sm text-muted">بررسی اقلام و ادامه به پرداخت.</p>
        </div>
      </FadeSlideIn>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="divide-y divide-border">
          {items.length === 0 && (
            <EmptyState
              title="سبد شما خالی است."
              description="می‌توانید از اینجا خرید را شروع کنید."
              action={{ label: "جستجوی داروخانه‌ها", href: "/pharmacies" }}
            />
          )}
          {grouped.map((group) => (
            <div key={group.pharmacyId} className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-primary-900">{group.pharmacyName}</p>
                  <p className="text-xs text-muted">
                    {group.etaLabel ? `ارسال ${group.etaLabel}` : "زمان ارسال برآورد نشده"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {group.rating && (
                    <Badge variant="info" className="rounded-full px-2 py-1 text-[11px]">
                      {group.rating.toLocaleString("fa-IR", { minimumFractionDigits: 1 })} ★
                    </Badge>
                  )}
                  <Badge variant={group.isOpen ? "success" : "warning"} className="rounded-full">
                    {group.isOpen ? "باز" : "بسته"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                {group.items.map(({ item, product }) => (
                  <motion.div
                    key={item.id}
                    className="flex items-start gap-3 rounded-[14px] border border-border bg-surface-2 p-3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <MediaPlaceholder aspect="square" className="w-16 flex-none rounded-xl" />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-semibold text-primary-900">{item.name}</p>
                          <p className="text-xs text-muted">
                            {product?.dosageFa ?? item.subtitle ?? product?.categoryFa ?? "بدون توضیح"}
                          </p>
                          {product?.rxRequired && <span className="text-[11px] text-warning">نیازمند نسخه</span>}
                        </div>
                        <p className="text-sm font-semibold text-primary-900">
                          {formatMoney(item.price * item.qty)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-1 px-2 py-1">
                          <button
                            className="grid h-8 w-8 place-items-center rounded-full text-primary-900 hover:bg-surface-3"
                            onClick={() => setItemQty(item.id, item.qty - 1)}
                            aria-label="کاهش"
                          >
                            -
                          </button>
                          <motion.span key={item.qty} initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="text-sm">
                            {formatNumber(item.qty)}
                          </motion.span>
                          <button
                            className="grid h-8 w-8 place-items-center rounded-full text-primary-900 hover:bg-surface-3"
                            onClick={() => setItemQty(item.id, item.qty + 1)}
                            aria-label="افزایش"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={cn(
                            "text-xs text-muted underline-offset-4 hover:text-danger hover:underline",
                            "transition-colors",
                          )}
                          onClick={() => removeFromCart(item.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <Card className="h-fit space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">خلاصه</h2>
            {needsRx && <Badge variant="warning">نیازمند نسخه</Badge>}
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <span>جمع اقلام</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-primary-900">
            <span>قابل پرداخت</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <Button className="w-full" asChild disabled={entries.length === 0}>
            <Link href="/checkout">ادامه پرداخت</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/pharmacies">ادامه خرید</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
