"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultPickerSheet } from "@/components/prescriptions/vault-picker-sheet";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { removeFromCart, setItemQty, useCartItems } from "@/stores/cart";
import { useCartGuard } from "@/components/cart/useCartGuard";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | undefined>();
  const { toast } = useToast();
  const cartItems = useCartItems();
  const { requestAdd, conflictSheet } = useCartGuard();
  const qty = cartItems.find((c) => c.id === params.id)?.qty ?? 0;

  useEffect(() => {
    api.getProduct(params.id).then(setProduct);
  }, [params.id]);

  if (!product) {
    return (
      <div className="space-y-4 pb-12">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  const handleAdd = () => {
    const conflict = cartItems.length > 0 && cartItems.some((c) => c.pharmacyId !== product.pharmacyId);
    requestAdd({
      id: product.id,
      pharmacyId: product.pharmacyId,
      name: product.nameFa,
      subtitle: product.dosageFa,
      price: product.priceToman,
      qty: 1,
    });
    if (!conflict) {
      toast({ title: "به سبد اضافه شد", description: product.nameFa });
    }
  };

  const updateQty = (nextQty: number) => {
    if (nextQty <= 0) {
      removeFromCart(product.id);
    } else {
      setItemQty(product.id, nextQty);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border border-border bg-surface-1 md:flex">
        <div className="relative h-64 flex-1 md:h-auto">
          <MediaPlaceholder aspect="wide" className="h-full w-full rounded-none" />
          {product.rxRequired && (
            <Badge variant="warning" className="absolute left-4 top-4">
              نیازمند نسخه
            </Badge>
          )}
        </div>
        <div className="flex-1 space-y-4 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">{product.nameFa}</CardTitle>
            <p className="text-muted">{product.dosageFa}</p>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">موجودی {product.stock}</Badge>
              <Badge variant="outline">{product.categoryFa}</Badge>
            </div>
            <p className="text-text/80">{product.descriptionFa}</p>
            {product.warningsFa.length > 0 && (
              <div className="rounded-2xl border border-warning/40 bg-warning/5 p-3 text-sm text-warning">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  هشدار مصرف
                </div>
                <ul className="mt-2 list-disc pr-5 text-warning/90">
                  {product.warningsFa.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center gap-2 text-2xl font-semibold">
              {formatMoney(product.priceToman)}
              {product.rxRequired && <ShieldAlert className="h-5 w-5 text-warning" />}
            </div>
            <div className="flex flex-wrap gap-3">
              {qty > 0 ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface-1 px-2 py-1">
                  <button
                    className="grid h-9 w-9 place-items-center rounded-full text-primary-900 hover:bg-surface-3"
                    onClick={() => updateQty(qty - 1)}
                    aria-label="کاهش"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold">{qty.toLocaleString("fa-IR")}</span>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-full text-primary-900 hover:bg-surface-3"
                    onClick={() => updateQty(qty + 1)}
                    aria-label="افزایش"
                  >
                    +
                  </button>
                </div>
              ) : (
                <Button onClick={handleAdd}>افزودن به سبد</Button>
              )}
              {product.rxRequired && (
                <VaultPickerSheet>
                  <Button variant="outline">انتخاب نسخه از گنجه</Button>
                </VaultPickerSheet>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-brand/5 px-3 py-2 text-sm text-brand">
              <ShieldCheck className="h-4 w-4" />
              نسخه شما فقط برای این سفارش نمایش داده می‌شود.
            </div>
          </CardContent>
        </div>
      </Card>
      {conflictSheet}
    </div>
  );
}
