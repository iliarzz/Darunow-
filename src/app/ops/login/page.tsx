"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PillHero } from "@/components/brand/PillHero";

export default function OpsLoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">در حال بارگذاری...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("ops@darunow.test");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") || "/ops";
  const { toast } = useToast();

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("login failed");
      toast({ title: "ورود موفق" });
      router.push(next);
    } catch (err) {
      toast({ title: "ورود ناموفق", description: "اطلاعات ورود بررسی شود." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-4 py-8">
      <PillHero title="ورود اپراتور" subtitle="دسترسی مرکز عملیات دارونَو" className="h-44" />
      <Card className="space-y-4 border border-border/70 bg-surface-1 p-5 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">ایمیل</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">رمز عبور</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-full" />
        </div>
        <Button className="w-full rounded-full" onClick={submit} disabled={loading}>
          ورود
        </Button>
      </Card>
    </div>
  );
}
