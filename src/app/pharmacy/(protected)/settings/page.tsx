"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PharmacySettingsPage() {
  return (
    <div className="space-y-4 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-text">تنظیمات داروخانه</h1>
        <p className="text-sm text-muted">اطلاعات تماس و ساعات کاری</p>
      </div>
      <Card className="space-y-3 border border-border/70 p-4">
        <Input placeholder="نام داروخانه" className="rounded-full" />
        <Input placeholder="تلفن تماس" className="rounded-full" />
        <Input placeholder="ساعات کاری" className="rounded-full" />
        <Button className="rounded-full">ذخیره</Button>
      </Card>
    </div>
  );
}
