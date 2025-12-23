"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTime } from "@/lib/format";
import { listReminders, toggleReminder, removeReminder } from "@/stores/reminders";

export default function RemindersPage() {
  const reminders = listReminders();

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">یادآورها</h1>
          <p className="text-sm text-muted">زمان‌بندی مصرف دارو</p>
        </div>
        <Button asChild className="rounded-full px-4">
          <Link href="/profile/reminders/new">یادآور جدید</Link>
        </Button>
      </div>
      {reminders.length === 0 ? (
        <EmptyState title="یادآوری ثبت نشده." action={{ label: "ساخت یادآور", href: "/profile/reminders/new" }} />
      ) : (
        <div className="space-y-3">
          {reminders.map((rem) => (
            <Card key={rem.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{rem.title}</p>
                  <p className="text-xs text-muted">
                    {rem.times.map((t) => formatTime(`2024-01-01T${t}`)).join("، ")} • روزهای {rem.days.join(",")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={rem.enabled}
                    onChange={(e) => toggleReminder(rem.id, e.target.checked)}
                  />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/profile/reminders/${rem.id}/edit`}>ویرایش</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeReminder(rem.id)}>
                    حذف
                  </Button>
                </div>
              </div>
              {rem.dosage && <p className="text-xs text-muted">دوز: {rem.dosage}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
