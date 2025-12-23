"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { setDefaultAddress, useAddresses } from "@/stores/address";
import { getCityName, getProvinceName } from "@/lib/location/iran";

type Props = {
  children: React.ReactNode;
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function AddressPickerSheet({ children, selectedId, onSelect }: Props) {
  const addresses = useAddresses();
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const loading = !hydrated;

  const handleSelect = (id: string) => {
    onSelect(id);
    setDefaultAddress(id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-right">
            <MapPin className="h-5 w-5 text-brand" />
            انتخاب آدرس
          </SheetTitle>
          <p className="text-sm text-muted">تحویل را به آدرس مطمئن ثبت کن.</p>
        </SheetHeader>

        {loading && (
          <div className="space-y-3 pt-3">
            {[1, 2].map((k) => (
              <Skeleton key={k} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="pt-3">
            <ErrorState
              title="خطا در بارگذاری"
              description="دوباره تلاش کن."
              onRetry={() => setError(null)}
            />
          </div>
        )}

        {!loading && !error && addresses.length === 0 && (
          <div className="pt-3">
            <EmptyState
              title="آدرسی ثبت نشده."
              action={{ label: "افزودن آدرس جدید", href: "/profile/addresses/new" }}
            />
          </div>
        )}

        {!loading && !error && addresses.length > 0 && (
          <div className="space-y-3 pt-3">
            {addresses.map((addr) => {
              const active = selectedId ? selectedId === addr.id : addr.isDefault;
              return (
                <button
                  key={addr.id}
                  onClick={() => handleSelect(addr.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-right transition hover:border-brand ${
                    active ? "border-brand bg-brand/5" : "border-border bg-surface-1"
                  }`}
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
                    <span className="text-xs text-muted">
                      {getProvinceName(addr.province)} · {getCityName(addr.city)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-text">{addr.recipientName}</p>
                  <p className="text-xs text-muted">{[addr.line1, addr.line2].filter(Boolean).join(" · ")}</p>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-dashed border-border px-3 py-2">
          <div className="text-sm text-text">آدرس تازه لازم داری؟</div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/profile/addresses/new">آدرس جدید</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
