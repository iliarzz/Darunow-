"use client";

import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format";

export function ConsentCard({
  expiresAt,
  checked,
  onChange,
}: {
  expiresAt: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Card className="border-brand/30 bg-brand/5 shadow-brand">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/20 text-brand">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">اعطای دسترسی نسخه</CardTitle>
            <p className="text-sm text-muted">فقط برای این سفارش و با انقضای خودکار.</p>
          </div>
        </div>
        <Badge variant="outline">انقضا {formatDate(expiresAt)}</Badge>
      </CardHeader>
      <CardContent className="flex items-start gap-3">
        <Checkbox id="consent" checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
        <label htmlFor="consent" className="text-sm text-text/80">
          اجازه می‌دهم داروخانه فقط برای همین سفارش نسخه انتخاب‌شده را مشاهده کند. دسترسی خودکار منقضی می‌شود.
        </label>
      </CardContent>
    </Card>
  );
}
