"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddressForm, type AddressFormValues } from "@/components/address/AddressForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { removeAddress, updateAddress, useAddresses } from "@/stores/address";

export default function EditAddressPage({ params }: { params: { id: string } }) {
  const addresses = useAddresses();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const address = useMemo(() => addresses.find((a) => a.id === params.id), [addresses, params.id]);

  const handleSubmit = async (values: AddressFormValues) => {
    updateAddress(params.id, values);
    router.push("/profile/addresses");
  };

  if (!hydrated) {
    return (
      <div className="space-y-4 pb-12">
        <Header />
        <Card className="rounded-2xl border border-border/70 bg-white p-4 shadow-xs">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="mt-3 h-12 w-full rounded-2xl" />
          <Skeleton className="mt-3 h-12 w-full rounded-2xl" />
        </Card>
      </div>
    );
  }

  if (!address) {
    return (
      <EmptyState
        title="آدرس پیدا نشد."
        description="ممکن است حذف شده باشد."
        action={{ label: "افزودن آدرس جدید", href: "/profile/addresses/new" }}
      />
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <Header />
      <AddressForm initial={address} submitLabel="ذخیره تغییرات" onSubmit={handleSubmit} />
      <div className="flex justify-end">
        <Button
          variant="destructive"
          className="rounded-full"
          onClick={() => {
            if (confirm("آدرس حذف شود؟")) {
              removeAddress(address.id);
              router.push("/profile/addresses");
            }
          }}
        >
          حذف آدرس
        </Button>
      </div>
    </div>
  );
}

function Header() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text">ویرایش آدرس</h1>
        <p className="text-sm text-muted">جزئیات را به‌روز کن.</p>
      </div>
      <Button variant="ghost" className="rounded-full px-4" onClick={() => router.back()}>
        بازگشت
      </Button>
    </div>
  );
}
