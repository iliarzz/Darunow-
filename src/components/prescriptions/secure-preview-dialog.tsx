"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Prescription } from "@/lib/types";

export function SecurePreviewDialog({
  prescription,
  open,
  onOpenChange,
}: {
  prescription?: Prescription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (open && prescription) {
      setLoading(true);
      api.getPrescriptionSignedUrl(prescription.id).then(({ url, expiresAt: exp }) => {
        if (!active) return;
        setSignedUrl(url);
        setExpiresAt(exp);
        setLoading(false);
      });
    } else {
      setSignedUrl(null);
      setExpiresAt(null);
    }
    return () => {
      active = false;
    };
  }, [open, prescription?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>پیش‌نمایش امن</DialogTitle>
          <DialogDescription>{prescription ? "لینک امضاشده موقت" : "نسخه‌ای را انتخاب کنید"}</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80">
          {loading || !signedUrl ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <img src={signedUrl} alt="نسخه" className="h-72 w-full object-cover" />
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <span>لینک امضا شده آماده است</span>
          </div>
          {expiresAt && <Badge variant="outline">انقضا {formatDate(expiresAt)}</Badge>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
