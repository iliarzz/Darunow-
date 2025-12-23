"use client";

import { motion } from "framer-motion";
import { Pill, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/lib/types";
import { removeFromCart, setItemQty, useCartItems } from "@/stores/cart";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { formatMoney } from "@/lib/format";
import { useCartGuard } from "@/components/cart/useCartGuard";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { toast } = useToast();
  const cartItems = useCartItems();
  const { requestAdd, conflictSheet } = useCartGuard();
  const qty = cartItems.find((c) => c.id === product.id)?.qty ?? 0;
  const stockLabel = useMemo(() => {
    if (product.stock < 10) return "موجودی کم";
    if (product.stock < 30) return "محدود";
    return "موجود";
  }, [product.stock]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card interactive className="h-full overflow-hidden border border-border bg-surface-1 p-3">
        <div className="flex gap-3">
          <div className="w-28 flex-none">
            <MediaPlaceholder aspect="square" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-semibold text-primary-900">{product.nameFa}</p>
                <p className="text-sm text-muted">{product.dosageFa}</p>
              </div>
              {product.rxRequired && (
                <Badge variant="warning" className="px-2 py-1 text-[11px]">
                  نیازمند نسخه
                </Badge>
              )}
            </div>
            <p className="text-sm text-primary-900/80 line-clamp-2">{product.descriptionFa}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge variant="neutral">{stockLabel}</Badge>
              <Badge variant="info">{product.categoryFa}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary-900">
                {formatMoney(product.priceToman)}
                {product.rxRequired && <ShieldAlert className="h-4 w-4 text-warning" />}
              </div>
              {qty > 0 ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface-1 px-2 py-1">
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full text-primary-900 hover:bg-surface-3"
                    onClick={() => updateQty(qty - 1)}
                    aria-label="کاهش"
                  >
                    -
                  </button>
                  <motion.span key={qty} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-sm font-semibold">
                    {qty.toLocaleString("fa-IR")}
                  </motion.span>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full text-primary-900 hover:bg-surface-3"
                    onClick={() => updateQty(qty + 1)}
                    aria-label="افزایش"
                  >
                    +
                  </button>
                </div>
              ) : (
                <Button size="sm" onClick={handleAdd} icon={<Pill className="h-4 w-4" />}>
                  افزودن
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      {conflictSheet}
    </motion.div>
  );
}
