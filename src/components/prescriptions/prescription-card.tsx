"use client";

import { motion } from "framer-motion";
import { Eye, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessGrantBadge } from "@/components/prescriptions/access-grant-badge";
import { formatDate } from "@/lib/format";
import type { AccessGrant, Prescription } from "@/lib/types";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";

type Mode = "default" | "select";

export function PrescriptionCard({
  prescription,
  grant,
  onSelect,
  onPreview,
  onManageAccess,
  mode = "default",
  index = 0,
}: {
  prescription: Prescription;
  grant?: AccessGrant;
  onSelect?: (id: string) => void;
  onPreview?: (id: string) => void;
  onManageAccess?: (id: string) => void;
  mode?: Mode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full overflow-hidden border border-border/70 bg-card/90 backdrop-blur-md">
        <CardHeader className="flex items-start justify-between space-y-0">
          <div>
            <Badge variant={prescription.status === "ردشده" ? "error" : "success"} className="mb-1">
              {prescription.status}
            </Badge>
            <CardTitle className="text-base font-semibold">نسخه</CardTitle>
            <p className="text-sm text-muted">تاریخ {formatDate(prescription.createdAt)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Stethoscope className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <span>{prescription.doctorName ?? "پزشک"} </span>
          </div>
          <MediaPlaceholder aspect="wide" className="h-32 w-full">
            <span className="text-xs text-muted">پیش‌نمایش امن نسخه</span>
          </MediaPlaceholder>
          {grant && <AccessGrantBadge grant={grant} />}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onPreview?.(prescription.id)}>
              <Eye className="h-4 w-4" />
              پیش‌نمایش امن
            </Button>
            {mode === "select" && (
              <Button size="sm" onClick={() => onSelect?.(prescription.id)}>
                استفاده برای سفارش
              </Button>
            )}
            {mode === "default" && grant && (
              <Button variant="outline" size="sm" onClick={() => onManageAccess?.(prescription.id)}>
                مدیریت دسترسی
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
