"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { setPortalSession } from "@/stores/portal-session";
import type { Permission, Role } from "@/lib/rbac/types";

type LoginResponse = {
  pharmacyId: string;
  pharmacyName: string;
  role: Role;
  permissions: Permission[];
};

const demoUsers = [
  "owner@darunow.local",
  "pharmacist@darunow.local",
  "operator@darunow.local",
  "finance@darunow.local",
  "support@darunow.local",
];

const fallbackPassword = "DarunowPortal123!";

function PharmacyPortalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(demoUsers[0]);
  const [password, setPassword] = useState(fallbackPassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next") ?? "/pharmacy-portal";
    if (!next.startsWith("/pharmacy-portal")) return "/pharmacy-portal";
    return next;
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as LoginResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "ورود انجام نشد");
      }

      setPortalSession({
        token: "cookie-session",
        pharmacyId: data.pharmacyId,
        pharmacyName: data.pharmacyName,
        role: data.role,
        permissions: data.permissions,
      });
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود انجام نشد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl space-y-5 rounded-2xl border border-divider bg-surface-1/95 p-6 shadow-soft">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full px-3 py-[6px] text-[12px]">
            Pharmacy Portal
          </Badge>
          <h1 className="text-2xl font-bold text-primary-900">ورود به پرتال داروخانه</h1>
          <p className="text-sm text-muted">برای شروع توسعه عملیات داروخانه، با یکی از حساب‌های دمو وارد شوید.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="text-muted">نام کاربری</span>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl border-divider bg-surface-2/80" />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="text-muted">رمز عبور</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-divider bg-surface-2/80"
            />
          </label>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit" className="rounded-full" disabled={loading}>
              {loading ? "در حال ورود..." : "ورود به پرتال"}
            </Button>
            <Button type="button" variant="secondary" className="rounded-full" onClick={() => setPassword(fallbackPassword)}>
              بازنشانی رمز دمو
            </Button>
          </div>
        </form>

        <div className="space-y-2 rounded-xl border border-divider bg-surface-2/70 p-3">
          <p className="text-xs text-muted">حساب‌های دمو:</p>
          <div className="flex flex-wrap gap-2">
            {demoUsers.map((user) => (
              <button
                key={user}
                type="button"
                className="rounded-full border border-divider bg-surface-1 px-3 py-1 text-xs text-primary-900 transition hover:border-primary-300"
                onClick={() => setUsername(user)}
              >
                {user}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            رمز پیش‌فرض: <span className="font-semibold text-primary-900 ltr inline-flex">{fallbackPassword}</span>
          </p>
          <p className="text-xs text-muted">
            اگر رمز را در محیط عوض کردید، مقدار <code>PORTAL_DEMO_PASSWORD</code> را استفاده کنید.
          </p>
        </div>

        <div className="text-sm text-muted">
          برگشت به <Link href="/coming-soon" className="font-semibold text-primary-900 hover:underline">صفحه اطلاع‌رسانی</Link>
        </div>
      </Card>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl space-y-3 rounded-2xl border border-divider bg-surface-1/95 p-6 shadow-soft">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </Card>
    </div>
  );
}

export default function PharmacyPortalLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <PharmacyPortalLoginContent />
    </Suspense>
  );
}
