"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addToCart, cartHasDifferentPharmacy, clearCart, type CartItemInput, useCartItems } from "@/stores/cart";
import { track } from "@/lib/track";

type GuardResult = {
  requestAdd: (input: CartItemInput) => void;
  conflictSheet: React.ReactNode;
};

export function useCartGuard(): GuardResult {
  const items = useCartItems();
  const [pending, setPending] = useState<CartItemInput | null>(null);
  const [open, setOpen] = useState(false);

  const currentPharmacyId = items[0]?.pharmacyId;
  const hasConflict = useMemo(
    () => (pending ? cartHasDifferentPharmacy(pending.pharmacyId, items) : false),
    [items, pending],
  );

  const applyAdd = (input: CartItemInput) => {
    addToCart(input);
    track("add_to_cart", { pharmacyId: input.pharmacyId, productId: input.id, qty: input.qty ?? 1 });
  };

  const requestAdd = (input: CartItemInput) => {
    if (items.length === 0 || !cartHasDifferentPharmacy(input.pharmacyId, items)) {
      applyAdd(input);
      return;
    }
    setPending(input);
    setOpen(true);
  };

  const replaceCart = () => {
    if (!pending) return;
    clearCart();
    applyAdd(pending);
    setPending(null);
    setOpen(false);
  };

  return {
    requestAdd,
    conflictSheet: (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="space-y-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-right">
              <AlertTriangle className="h-4 w-4 text-warning" />
              سبد شما مربوط به داروخانه دیگری است
            </SheetTitle>
            <p className="text-sm text-muted">
              برای ادامه باید یک داروخانه را انتخاب کنی. می‌توانی سبد فعلی را پاک کنی یا به سبد بروی.
            </p>
            {currentPharmacyId && (
              <Badge variant="outline" className="w-fit">
                سبد فعلی: {currentPharmacyId}
              </Badge>
            )}
          </SheetHeader>
          <div className="grid gap-2">
            <Button variant="primary" className="w-full rounded-full" onClick={replaceCart} disabled={!hasConflict}>
              پاک کردن سبد و افزودن این مورد
            </Button>
            <Button asChild variant="secondary" className="w-full rounded-full">
              <Link href="/cart">رفتن به سبد</Link>
            </Button>
            <Button variant="ghost" className="w-full rounded-full" onClick={() => setOpen(false)}>
              لغو
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    ),
  };
}
