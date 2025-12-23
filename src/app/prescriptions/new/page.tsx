"use client";

import { Suspense } from "react";
import { PrescriptionUploader } from "@/components/prescriptions/prescription-uploader";
import { Card } from "@/components/ui/card";

export default function NewPrescriptionPage() {
  return (
    <div className="space-y-6 pb-16 pt-2">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted">گنجه نسخه</p>
        <h1 className="text-3xl font-bold text-text">آپلود نسخه</h1>
        <p className="text-sm text-muted">تصویر یا PDF نسخه خود را بارگذاری کنید.</p>
      </div>
      <Card className="p-6 shadow-soft">
        <Suspense fallback={<div className="space-y-3"><div className="h-4 w-32 rounded-full bg-surface-3" /><div className="h-32 w-full rounded-2xl bg-surface-3" /></div>}>
          <PrescriptionUploader />
        </Suspense>
      </Card>
    </div>
  );
}
