"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  removeAddress,
  setDefaultAddress,
  useAddresses,
} from "@/stores/address";
import { getCityName, getProvinceName } from "@/lib/location/iran";

export default function AddressesPage() {
  const addresses = useAddresses();
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const loading = !hydrated;
  const sorted = useMemo(() => addresses, [addresses]);

  if (error) {
    return (
      <div className="space-y-4 pb-12">
        <Header />
        <ErrorState
          title="مشکلی پیش آمد"
          description="در بارگذاری آدرس‌ها خطا رخ داد."
          onRetry={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <Header />
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((key) => (
            <Card key={key} className="rounded-2xl border border-border/70 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-4 w-3/4 rounded-full" />
              <Skeleton className="mt-2 h-4 w-1/2 rounded-full" />
            </Card>
          ))}
        </div>
      )}
      {!loading && sorted.length === 0 && (
        <EmptyState
          title="هنوز آدرسی ثبت نکردی."
          action={{ label: "افزودن آدرس", href: "/profile/addresses/new" }}
        />
      )}
      {!loading && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((addr) => (
            <Card
              key={addr.id}
              className="space-y-3 rounded-2xl border border-border/70 bg-white p-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Chip className="border-brand bg-accent-200/60 text-primary-800">
                    {addr.label}
                  </Chip>
                  {addr.isDefault && (
                    <Badge variant="success" className="rounded-full">
                      پیش‌فرض
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
                    <Link href={`/profile/addresses/${addr.id}/edit`}>ویرایش</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setConfirmingId(addr.id)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-text/80">
                <p className="font-semibold">{addr.recipientName}</p>
                <p className="text-muted">
                  {getProvinceName(addr.province)}، {getCityName(addr.city)}
                </p>
                <p className="line-clamp-1">{[addr.line1, addr.line2].filter(Boolean).join(" · ")}</p>
                {addr.notes && <p className="text-muted text-xs">{addr.notes}</p>}
              </div>
              {!addr.isDefault && (
                <Button
                  size="sm"
                  variant="brandGhost"
                  className="rounded-full"
                  onClick={() => setDefaultAddress(addr.id)}
                >
                  انتخاب به‌عنوان پیش‌فرض
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {confirmingId && (
        <Sheet open={Boolean(confirmingId)} onOpenChange={(open) => !open && setConfirmingId(null)}>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>حذف آدرس</SheetTitle>
              <p className="text-sm text-muted">از حذف آدرس مطمئنی؟</p>
            </SheetHeader>
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setConfirmingId(null)}
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                className="rounded-full"
                onClick={() => {
                  if (confirmingId) removeAddress(confirmingId);
                  setConfirmingId(null);
                }}
              >
                حذف
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text">آدرس‌ها</h1>
        <p className="text-sm text-muted">مدیریت تحویل‌های پیش‌فرض.</p>
      </div>
      <Button asChild className="rounded-full px-4">
        <Link href="/profile/addresses/new">افزودن آدرس</Link>
      </Button>
    </div>
  );
}
