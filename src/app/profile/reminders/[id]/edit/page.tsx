"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { getReminder, updateReminder } from "@/stores/reminders";
import { useToast } from "@/components/ui/use-toast";

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export default function EditReminderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const reminder = getReminder(params.id);
  const [title, setTitle] = useState(reminder?.title ?? "");
  const [dosage, setDosage] = useState(reminder?.dosage ?? "");
  const [times, setTimes] = useState<string[]>(reminder?.times ?? ["08:00"]);
  const [days, setDays] = useState<number[]>(reminder?.days ?? [0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    if (!reminder) router.push("/profile/reminders");
  }, [reminder, router]);

  const toggleDay = (idx: number) =>
    setDays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort()));

  const save = () => {
    if (!title) {
      toast({ title: "عنوان لازم است", description: "یک عنوان کوتاه وارد کن." });
      return;
    }
    updateReminder(params.id, { title, dosage, times, days });
    toast({ title: "یادآور به‌روزرسانی شد" });
    router.push("/profile/reminders");
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">ویرایش یادآور</h1>
          <p className="text-sm text-muted">زمان و روزهای یادآوری را تنظیم کن.</p>
        </div>
        <Button variant="ghost" className="rounded-full px-4" onClick={() => router.back()}>
          بازگشت
        </Button>
      </div>
      <Card className="space-y-4 p-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-text">عنوان</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-full" placeholder="مثال: قرص صبح" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-text">دوز (اختیاری)</label>
          <Input value={dosage} onChange={(e) => setDosage(e.target.value)} className="rounded-full" placeholder="مثال: ۱ عدد" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">ساعت‌ها</label>
          <div className="flex flex-wrap gap-2">
            {times.map((t, idx) => (
              <Chip key={idx} selected className="bg-accent-200/60 text-primary-800">
                {t}
              </Chip>
            ))}
            <Input
              type="time"
              className="w-32 rounded-full"
              value={times[0]}
              onChange={(e) => setTimes([e.target.value])}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">روزها</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((d, idx) => (
              <Chip key={d} selected={days.includes(idx)} onClick={() => toggleDay(idx)}>
                {d}
              </Chip>
            ))}
          </div>
        </div>
        <Button className="w-full rounded-full" onClick={save}>
          ذخیره
        </Button>
      </Card>
    </div>
  );
}
