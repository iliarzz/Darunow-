"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PillHero } from "@/components/brand/PillHero";

export default function PharmacyLoginPage() {
  const [phone, setPhone] = useState("09120000001");
  const [code, setCode] = useState("123456");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pharmacy/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      if (!res.ok) throw new Error("login failed");
      toast({ title: "ورود موفق" });
      router.push("/pharmacy/orders");
    } catch (err) {
      toast({ title: "ورود ناموفق", description: "اطلاعات را بررسی کن." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 pb-16 pt-10">
      <PillHero title="ورود داروخانه" subtitle="کد ارسال شده را وارد کنید." />
      <Card className="space-y-4 border border-border p-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">موبایل</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">کد ورود</label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} className="rounded-full" />
        </div>
        <Button className="w-full rounded-full" onClick={submit} disabled={loading}>
          ورود
        </Button>
      </Card>
    </div>
  );
}
