"use client";

import Link from "next/link";
import { MapPin, CreditCard, ShieldCheck, BellRing, LifeBuoy, ClipboardList, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { FadeSlideIn } from "@/components/motion/fade-slide-in";
import { useAddresses } from "@/stores/address";
import { useOrders } from "@/stores/orders";
import { useReminders } from "@/stores/reminders";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCityName, getProvinceName } from "@/lib/location/iran";
import { useNotificationsCount } from "@/lib/useNotificationsCount";

const links = [
  { title: "آدرس‌ها", href: "/profile/addresses", subtitle: "مدیریت تحویل", icon: MapPin },
  { title: "روش‌های پرداخت", href: "/profile/payments", subtitle: "آفلاین/آنلاین", icon: CreditCard },
  { title: "پروفایل بیمار", href: "/profile/patient", subtitle: "اطلاعات اختیاری", icon: ShieldCheck },
  { title: "یادآورها", href: "/profile/reminders", subtitle: "داروها و زمان‌بندی", icon: BellRing },
  { title: "اعلان‌ها", href: "/notifications", subtitle: "پیام‌ها و وضعیت", icon: Bell },
  { title: "پشتیبانی", href: "/support", subtitle: "تیکت و پیگیری", icon: LifeBuoy },
];

export default function ProfilePage() {
  const addresses = useAddresses();
  const orders = useOrders();
  const reminders = useReminders();
  const notificationsCount = useNotificationsCount();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  return (
    <div className="space-y-5 pb-16">
      <FadeSlideIn>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text">پروفایل</h1>
          <p className="text-sm text-muted">کنترل کامل تحویل، پرداخت و پشتیبانی.</p>
        </div>
      </FadeSlideIn>

      <Card className="rounded-2xl border border-border/70 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">آدرس پیش‌فرض</p>
            {defaultAddress ? (
              <>
                <p className="text-base font-semibold text-text">{defaultAddress.recipientName}</p>
                <p className="text-xs text-muted">
                  {getProvinceName(defaultAddress.province)}، {getCityName(defaultAddress.city)}
                </p>
                <p className="text-xs text-text/80 line-clamp-1">
                  {[defaultAddress.line1, defaultAddress.line2].filter(Boolean).join(" · ")}
                </p>
              </>
            ) : (
              <p className="text-sm text-warning">آدرسی ثبت نشده.</p>
            )}
          </div>
          <Chip className="border-brand bg-accent-200/60 text-primary-800">
            {defaultAddress ? defaultAddress.label : "نامشخص"}
          </Chip>
        </div>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-full px-4">
            <Link href="/profile/addresses">مدیریت آدرس</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/checkout">استفاده در پرداخت</Link>
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/70 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text">وضعیت‌ها</p>
          <Badge variant="outline" className="rounded-full">
            به‌روز
          </Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="سفارش‌ها" value={orders.length} icon={<ClipboardList className="h-4 w-4 text-brand" />} />
          <StatCard label="آدرس‌ها" value={addresses.length} icon={<MapPin className="h-4 w-4 text-brand" />} />
          <StatCard label="یادآورها" value={reminders.length} icon={<BellRing className="h-4 w-4 text-brand" />} />
          <StatCard label="اعلان‌ها" value={notificationsCount} icon={<Bell className="h-4 w-4 text-brand" />} />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.title} href={item.href} className="group">
            <Card className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface-1 p-4 shadow-xs transition group-hover:border-brand/50">
              <div>
                <p className="text-base font-semibold text-text">{item.title}</p>
                <p className="text-sm text-muted">{item.subtitle}</p>
                {item.href === "/notifications" && notificationsCount > 0 && (
                  <p className="mt-1 text-xs font-semibold text-primary-800">
                    {notificationsCount.toLocaleString("fa-IR")} اعلان جدید
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-200/60 text-primary-800">
                <item.icon className="h-5 w-5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {orders.length === 0 && (
        <EmptyState
          title="سفارشی ثبت نشده."
          description="سریع سفارش جدید ثبت کن."
          action={{ label: "شروع خرید", href: "/pharmacies" }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface-2 p-3">
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-lg font-bold text-text">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-200/60 text-primary-800">
        {icon}
      </div>
    </div>
  );
}
