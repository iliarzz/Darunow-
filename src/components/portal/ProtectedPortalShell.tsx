"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { clearPortalSession, setPortalSession } from "@/stores/portal-session";
import { portalApi } from "@/lib/portal/api";
import type { Permission, Role } from "@/lib/rbac/types";

type SessionData = {
  pharmacyId: string;
  pharmacyName: string;
  role: Role;
  permissions: Permission[];
};

export function ProtectedPortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loginHref = useMemo(() => {
    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    return `/pharmacy-portal/login${next}`;
  }, [pathname]);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await portalApi.me();
      setSession(me);
      setPortalSession({
        token: "cookie-session",
        pharmacyId: me.pharmacyId,
        pharmacyName: me.pharmacyName,
        role: me.role,
        permissions: me.permissions,
      });
    } catch (err) {
      clearPortalSession();
      const message = err instanceof Error ? err.message : "دسترسی به پرتال ممکن نیست";
      if (message.toLowerCase().includes("unauthorized") || message.includes("401")) {
        router.replace(loginHref);
        return;
      }
      setError(message);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [loginHref, router]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const handleLogout = async () => {
    try {
      await fetch("/api/portal/logout", { method: "POST" });
    } finally {
      clearPortalSession();
      router.replace("/pharmacy-portal/login");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-5">
        <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
          <Skeleton className="h-4 w-44 rounded-full" />
          <Skeleton className="h-8 w-72 rounded-xl" />
        </Card>
        <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/95 p-4 shadow-soft">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Card className="rounded-2xl border border-divider bg-surface-1/95 p-6 shadow-soft">
          <EmptyState title="دسترسی به پرتال ممکن نیست" description={error ?? "جلسه معتبر یافت نشد."} />
          <div className="mt-4 flex justify-center">
            <Button asChild className="rounded-full">
              <a href={loginHref}>بازگشت به ورود</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <PortalLayout
      pharmacyName={session.pharmacyName}
      pharmacyId={session.pharmacyId}
      role={session.role}
      permissions={session.permissions}
      onLogout={handleLogout}
    >
      {children}
    </PortalLayout>
  );
}
