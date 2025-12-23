"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reorderIntoCart } from "@/lib/reorder";
import type { Order } from "@/lib/types-v2";
import { useToast } from "@/components/ui/use-toast";

export function useReorderAction() {
  const [pending, setPending] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleReorder = (order: Order) => {
    const result = reorderIntoCart(order);
    if (result.conflict) {
      setPending(order);
      setOpen(true);
      return;
    }
    toast({ title: "به سبد اضافه شد", description: "برای بررسی اقلام به سبد برو." });
    router.push("/cart");
  };

  const replaceAndReorder = () => {
    if (!pending) return;
    reorderIntoCart(pending, { forceClear: true });
    toast({ title: "سبد جایگزین شد", description: "سفارش قبلی تکرار شد." });
    setOpen(false);
    setPending(null);
    router.push("/cart");
  };

  return {
    reorder: handleReorder,
    conflictSheet: (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="space-y-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-right">
              <AlertTriangle className="h-4 w-4 text-warning" />
              سبد فعلی برای داروخانه دیگری است
            </SheetTitle>
            <p className="text-sm text-muted">می‌توانی سفارش فعلی را ثبت کنی یا سبد را پاک و سفارش قبلی را تکرار کنی.</p>
            {pending?.pharmacyId && <Badge variant="outline">داروخانه سفارش: {pending.pharmacyId}</Badge>}
          </SheetHeader>
          <div className="grid gap-2">
            <Button asChild variant="secondary" className="w-full rounded-full">
              <Link href="/cart">ثبت سفارش فعلی</Link>
            </Button>
            <Button
              variant="primary"
              className="w-full rounded-full"
              iconAfter={<RotateCcw className="h-4 w-4" />}
              onClick={replaceAndReorder}
            >
              پاک کردن سبد و تکرار
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
