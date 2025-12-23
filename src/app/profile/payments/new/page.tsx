"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { createPayment } from "@/stores/payment";
import { useToast } from "@/components/ui/use-toast";

export default function NewPaymentPage() {
  const [type, setType] = useState<"online" | "cod" | "card">("online");
  const [label, setLabel] = useState("پرداخت آنلاین");
  const [last4, setLast4] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const save = () => {
    createPayment({
      type,
      label: label || (type === "cod" ? "پرداخت در محل" : "پرداخت آنلاین"),
      last4: last4 || undefined,
      isDefault: true,
    });
    toast({ title: "ثبت شد", description: "روش پرداخت ذخیره شد." });
    router.push("/profile/payments");
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">روش پرداخت جدید</h1>
          <p className="text-sm text-muted">پرداخت امن و ساده.</p>
        </div>
        <Button variant="ghost" className="rounded-full" onClick={() => router.back()}>
          بازگشت
        </Button>
      </div>
      <Card className="space-y-4 p-4">
        <RadioGroup value={type} onValueChange={(v) => setType(v as any)} className="grid gap-2">
          <label className="flex items-center gap-2 rounded-2xl border border-border px-3 py-2">
            <RadioGroupItem value="online" />
            <span className="text-sm font-semibold">پرداخت آنلاین</span>
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-border px-3 py-2">
            <RadioGroupItem value="cod" />
            <span className="text-sm font-semibold">پرداخت در محل</span>
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-border px-3 py-2">
            <RadioGroupItem value="card" />
            <span className="text-sm font-semibold">کارت ذخیره شده</span>
          </label>
        </RadioGroup>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">عنوان</label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-full" />
        </div>
        {type === "card" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text">چهار رقم آخر</label>
            <Input value={last4} onChange={(e) => setLast4(e.target.value.slice(0, 4))} className="rounded-full" placeholder="۱۲۳۴" />
          </div>
        )}
        <Button className="w-full rounded-full" onClick={save}>
          ذخیره
        </Button>
      </Card>
    </div>
  );
}
