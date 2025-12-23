"use client";

import { useMemo, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { FadeSlideIn } from "@/components/motion/fade-slide-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrescriptionCard } from "@/components/prescriptions/prescription-card";
import { SecurePreviewDialog } from "@/components/prescriptions/secure-preview-dialog";
import { AccessGrantBadge } from "@/components/prescriptions/access-grant-badge";
import { useCartStore } from "@/store/cart";
import { useConfirm } from "@/components/confirm/useConfirm";

export default function PrescriptionsPage() {
  const prescriptions = useCartStore((s) => s.prescriptions);
  const accessGrants = useCartStore((s) => s.accessGrants);
  const removeAccessGrant = useCartStore((s) => s.removeAccessGrant);
  const removePrescription = useCartStore((s) => s.removePrescription);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const confirm = useConfirm();

  const grantsMap = useMemo(() => {
    const map = new Map<string, typeof accessGrants[number][]>();
    accessGrants.forEach((g) => {
      map.set(g.prescriptionId, [...(map.get(g.prescriptionId) ?? []), g]);
    });
    return map;
  }, [accessGrants]);

  const previewPrescription = prescriptions.find((p) => p.id === previewId);

  return (
    <div className="space-y-6 pb-12">
      <FadeSlideIn>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-muted">گنجه نسخه</p>
          <h1 className="text-2xl font-bold text-text md:text-3xl">نسخه‌ها</h1>
          <p className="text-sm text-muted">آپلود، پیش‌نمایش امن و مدیریت دسترسی.</p>
        </div>
      </FadeSlideIn>

      <Card className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-soft">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text">نسخه‌های ذخیره‌شده</p>
          <p className="text-xs text-muted">می‌توانید دسترسی داروخانه را در هر زمان لغو کنید.</p>
        </div>
        <Button variant="secondary" asChild>
          <a href="/prescriptions/new">
            <Upload className="h-4 w-4" />
            آپلود نسخه
          </a>
        </Button>
      </Card>

      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prescriptions.map((rx, idx) => (
          <StaggerItem key={rx.id}>
            <Card className="space-y-3 rounded-2xl border border-border/70 bg-card/90 p-3 shadow-soft">
              <PrescriptionCard
                prescription={rx}
                grant={grantsMap.get(rx.id)?.[0]}
                index={idx}
                onPreview={(id) => setPreviewId(id)}
              />
              {grantsMap.get(rx.id)?.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  {grantsMap.get(rx.id)!.map((g) => (
                    <AccessGrantBadge key={g.id} grant={g} />
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-danger"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "لغو دسترسی نسخه؟",
                        description: "پس از لغو، داروخانه دیگر نسخه را نمی‌بیند.",
                        confirmText: "لغو دسترسی",
                        cancelText: "انصراف",
                        variant: "destructive",
                      });
                      if (ok) removeAccessGrant(grantsMap.get(rx.id)![0].id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    لغو دسترسی
                  </Button>
                </div>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="text-danger"
                onClick={async () => {
                  const ok = await confirm({
                    title: "حذف نسخه؟",
                    description: "پس از حذف، امکان بازیابی وجود ندارد.",
                    confirmText: "حذف",
                    cancelText: "انصراف",
                    variant: "destructive",
                  });
                  if (ok) removePrescription(rx.id);
                }}
              >
                حذف نسخه
              </Button>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <SecurePreviewDialog
        prescription={previewPrescription}
        open={Boolean(previewPrescription)}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      />
    </div>
  );
}
