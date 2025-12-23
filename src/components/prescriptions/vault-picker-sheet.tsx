"use client";

import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PrescriptionCard } from "@/components/prescriptions/prescription-card";
import { SecurePreviewDialog } from "@/components/prescriptions/secure-preview-dialog";
import { useCartStore } from "@/store/cart";
import type { AccessGrant } from "@/lib/types";

export function VaultPickerSheet({
  children,
  onSelect,
  providerId,
  orderId,
}: {
  children: React.ReactNode;
  onSelect?: (id: string) => void;
  providerId?: string;
  orderId?: string;
}) {
  const prescriptions = useCartStore((s) => s.prescriptions);
  const selectPrescription = useCartStore((s) => s.selectPrescription);
  const accessGrants = useCartStore((s) => s.accessGrants);
  const addAccessGrant = useCartStore((s) => s.addAccessGrant);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    selectPrescription(id);
    onSelect?.(id);
    if (providerId && orderId) {
      addAccessGrant({
        prescriptionId: id,
        pharmacyId: providerId,
        orderId,
        scope: "view",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      });
    }
  };

  const grantsMap = useMemo(() => {
    const map = new Map<string, AccessGrant>();
    accessGrants.forEach((g) => map.set(g.prescriptionId, g));
    return map;
  }, [accessGrants]);

  const previewPrescription = prescriptions.find((p) => p.id === previewId);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>انتخاب نسخه</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {prescriptions.map((rx, idx) => (
            <PrescriptionCard
              key={rx.id}
              prescription={rx}
              grant={grantsMap.get(rx.id)}
              mode="select"
              index={idx}
              onSelect={handleSelect}
              onPreview={(id) => setPreviewId(id)}
            />
          ))}
        </div>
        <Separator className="my-4" />
        <SheetFooter className="justify-between">
          <p className="text-sm text-muted">فایل جدید نیاز دارید؟ آپلود کنید.</p>
          <Button asChild variant="secondary">
            <a href="/prescriptions/new">آپلود</a>
          </Button>
        </SheetFooter>
      </SheetContent>

      <SecurePreviewDialog
        prescription={previewPrescription}
        open={Boolean(previewPrescription)}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      />
    </Sheet>
  );
}
