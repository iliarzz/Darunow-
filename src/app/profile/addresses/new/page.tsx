"use client";

import { useRouter } from "next/navigation";
import { AddressForm, type AddressFormValues } from "@/components/address/AddressForm";
import { Button } from "@/components/ui/button";
import { createAddress } from "@/stores/address";

export default function NewAddressPage() {
  const router = useRouter();

  const handleSubmit = async (values: AddressFormValues) => {
    createAddress({
      ...values,
      isDefault: values.isDefault,
    });
    router.push("/profile/addresses");
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">آدرس جدید</h1>
          <p className="text-sm text-muted">جزئیات تحویل را کامل کن.</p>
        </div>
        <Button variant="ghost" className="rounded-full px-4" onClick={() => router.back()}>
          بازگشت
        </Button>
      </div>
      <AddressForm submitLabel="ذخیره آدرس" onSubmit={handleSubmit} />
    </div>
  );
}
