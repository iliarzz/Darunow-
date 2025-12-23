"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ProvinceCityCombobox } from "@/components/address/ProvinceCityCombobox";
import type { Address } from "@/lib/types-v2";

const addressFormSchema = z.object({
  label: z.enum(["خانه", "کار", "سایر"]),
  recipientName: z.string().min(2, "نام را وارد کنید"),
  phone: z.string().min(8, "شماره تماس الزامی است"),
  province: z.string().min(1, "استان را انتخاب کنید"),
  city: z.string().min(1, "شهر را انتخاب کنید"),
  line1: z.string().min(5, "آدرس را کامل وارد کنید"),
  line2: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

type Props = {
  initial?: Partial<Address>;
  submitLabel?: string;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
};

export function AddressForm({ initial, onSubmit, submitLabel = "ذخیره آدرس" }: Props) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: initial?.label ?? "خانه",
      recipientName: initial?.recipientName ?? "",
      phone: initial?.phone ?? "",
      province: initial?.province ?? "",
      city: initial?.city ?? "",
      line1: initial?.line1 ?? "",
      line2: initial?.line2 ?? "",
      postalCode: initial?.postalCode ?? "",
      notes: initial?.notes ?? "",
      isDefault: initial?.isDefault ?? false,
    },
  });

  useEffect(() => {
    if (initial) {
      form.reset({
        label: initial.label ?? "خانه",
        recipientName: initial.recipientName ?? "",
        phone: initial.phone ?? "",
        province: initial.province ?? "",
        city: initial.city ?? "",
        line1: initial.line1 ?? "",
        line2: initial.line2 ?? "",
        postalCode: initial.postalCode ?? "",
        notes: initial.notes ?? "",
        isDefault: initial.isDefault ?? false,
      });
    }
  }, [initial, form]);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
        <Card className="space-y-4 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-xs">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع آدرس</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {["خانه", "کار", "سایر"].map((lbl) => (
                      <Button
                        key={lbl}
                        type="button"
                        variant={field.value === lbl ? "primary" : "outline"}
                        className="w-full rounded-full"
                        onClick={() => field.onChange(lbl)}
                      >
                        {lbl}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>گیرنده</FormLabel>
                  <FormControl>
                    <Input placeholder="نام گیرنده" className="rounded-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تلفن تماس</FormLabel>
                  <FormControl>
                    <Input placeholder="۰۹۱۲..." className="rounded-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>کد پستی</FormLabel>
                  <FormControl>
                    <Input placeholder="۱۰ رقمی (اختیاری)" className="rounded-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <ProvinceCityCombobox
            provinceId={form.watch("province")}
            cityId={form.watch("city")}
            onProvinceChange={(id) => form.setValue("province", id, { shouldValidate: true })}
            onCityChange={(id) => form.setValue("city", id, { shouldValidate: true })}
            error={form.formState.errors.city?.message || form.formState.errors.province?.message}
          />

          <FormField
            control={form.control}
            name="line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>آدرس</FormLabel>
                <FormControl>
                  <Input placeholder="خیابان، کوچه، پلاک" className="rounded-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تکمیلی</FormLabel>
                  <FormControl>
                    <Input placeholder="واحد، طبقه، یادداشت کوتاه" className="rounded-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>یادداشت پیک</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: زنگ سوم" className="rounded-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-2 px-3 py-2">
                <div className="space-y-1">
                  <FormLabel className="text-sm font-semibold">استفاده به‌عنوان آدرس پیش‌فرض</FormLabel>
                  <p className="text-xs text-muted">برای سفارش‌های بعدی هم استفاده می‌شود.</p>
                </div>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                </FormControl>
              </FormItem>
            )}
          />
        </Card>
        <div className="flex items-center justify-end gap-2">
          <Button type="submit" className="rounded-full px-6">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
