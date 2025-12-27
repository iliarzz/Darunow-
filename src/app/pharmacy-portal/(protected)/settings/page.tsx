"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function PortalSettingsPage() {
  const [profile, setProfile] = useState({ name: "داروخانه مرکزی", phone: "021-123456", address: "تهران" });
  const [hours, setHours] = useState({ open: true, start: "08:00", end: "22:00" });
  const [radius, setRadius] = useState({ km: 8 });
  const [staff, setStaff] = useState([{ name: "علی رضایی", role: "OWNER", lastActive: "دیروز" }]);
  const { toast } = useToast();
  const initial = useMemo(() => ({ profile, hours, radius, staff }), []); // capture defaults once

  const dirtyProfile = useMemo(
    () => profile.name !== initial.profile.name || profile.phone !== initial.profile.phone || profile.address !== initial.profile.address,
    [initial.profile.address, initial.profile.name, initial.profile.phone, profile.address, profile.name, profile.phone],
  );
  const dirtyHours = useMemo(
    () => hours.open !== initial.hours.open || hours.start !== initial.hours.start || hours.end !== initial.hours.end,
    [hours.end, hours.open, hours.start, initial.hours.end, initial.hours.open, initial.hours.start],
  );
  const dirtyRadius = useMemo(() => radius.km !== initial.radius.km, [initial.radius.km, radius.km]);

  return (
    <div className="space-y-4 pb-16">
      <div>
        <p className="text-sm text-muted">تنظیمات داروخانه</p>
        <h1 className="text-2xl font-bold text-primary-900">تنظیمات</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-5 gap-2">
          <TabsTrigger value="profile">مشخصات</TabsTrigger>
          <TabsTrigger value="hours">ساعات کاری</TabsTrigger>
          <TabsTrigger value="radius">شعاع ارسال</TabsTrigger>
          <TabsTrigger value="staff">کاربران و نقش‌ها</TabsTrigger>
          <TabsTrigger value="integrations">یکپارچه‌سازی‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نام داروخانه</Label>
                <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="rounded-xl border-divider bg-surface-2/70" />
              </div>
              <div className="space-y-2">
                <Label>شماره تماس</Label>
                <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border-divider bg-surface-2/70" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>آدرس</Label>
                <Input value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} className="rounded-xl border-divider bg-surface-2/70" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="rounded-full" disabled={!dirtyProfile} onClick={() => toast({ title: "ذخیره شد" })}>
                ذخیره تغییرات
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <div className="flex items-center justify-between rounded-xl border border-divider bg-surface-2 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-primary-900">وضعیت فروشگاه</p>
                <p className="text-[12px] text-muted">باز / بسته</p>
              </div>
              <Checkbox checked={hours.open} onCheckedChange={(val) => setHours((h) => ({ ...h, open: Boolean(val) }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>شروع</Label>
                <Input type="time" value={hours.start} onChange={(e) => setHours((h) => ({ ...h, start: e.target.value }))} className="rounded-xl border-divider bg-surface-2/70" />
              </div>
              <div className="space-y-2">
                <Label>پایان</Label>
                <Input type="time" value={hours.end} onChange={(e) => setHours((h) => ({ ...h, end: e.target.value }))} className="rounded-xl border-divider bg-surface-2/70" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="rounded-full" disabled={!dirtyHours} onClick={() => toast({ title: "ساعات ثبت شد" })}>
                ذخیره
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="radius">
          <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <div className="space-y-1">
              <Label>شعاع ارسال (کیلومتر)</Label>
              <input
                type="range"
                min={1}
                max={30}
                value={radius.km}
                onChange={(e) => setRadius({ km: Number(e.target.value) })}
                className="w-full"
              />
              <Input
                type="number"
                value={radius.km}
                onChange={(e) => setRadius({ km: Number(e.target.value) })}
                className="w-24 rounded-xl border-divider bg-surface-2/70"
              />
              <p className="text-[12px] text-muted">سرویس‌دهی در شعاع {radius.km} کیلومتری</p>
            </div>
            <div className="flex justify-end">
              <Button className="rounded-full" disabled={!dirtyRadius} onClick={() => toast({ title: "شعاع ارسال به‌روزرسانی شد" })}>
                ذخیره
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card className="space-y-3 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">کاربران و نقش‌ها (فقط OWNER دسترسی دارد)</p>
              <Button size="sm" variant="secondary" className="rounded-full">
                افزودن کاربر
              </Button>
            </div>
            <div className="space-y-2">
              {staff.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-xl border border-divider bg-surface-2 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-primary-900">{s.name}</p>
                    <p className="text-[12px] text-muted">آخرین فعالیت: {s.lastActive}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full px-2 py-[6px] text-[12px]">
                      {s.role}
                    </Badge>
                    <Button size="sm" variant="ghost" className="rounded-full">
                      ⋯
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="space-y-2 rounded-2xl border border-divider bg-surface-1/90 p-4 shadow-soft">
            <p className="text-sm font-semibold text-primary-900">یکپارچه‌سازی‌ها</p>
            <p className="text-sm text-muted">به‌زودی</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
