"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/features/TagInput";
import { usePatientProfile, savePatientProfile } from "@/stores/patient";
import { formatDate } from "@/lib/format";

export default function PatientProfilePage() {
  const profile = usePatientProfile();
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [age, setAge] = useState(profile.age?.toString() ?? "");
  const [allergies, setAllergies] = useState<string[]>(profile.allergies ?? []);
  const [chronicMeds, setChronicMeds] = useState<string[]>(profile.chronicMeds ?? []);
  const [notes, setNotes] = useState(profile.notes ?? "");
  const [savedAt, setSavedAt] = useState(profile.updatedAt);

  useEffect(() => {
    setSavedAt(profile.updatedAt);
  }, [profile.updatedAt]);

  const save = () => {
    const next = savePatientProfile({
      fullName,
      age: age ? Number(age) : undefined,
      allergies,
      chronicMeds,
      notes,
    });
    setSavedAt(next.updatedAt);
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text">پروفایل بیمار</h1>
        <p className="text-sm text-muted">اطلاعات اختیاری است؛ برای مراقبت دقیق‌تر.</p>
      </div>
      <Card className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text">نام</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-full" placeholder="نام و نام خانوادگی" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text">سن</label>
            <Input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
              className="rounded-full"
              placeholder="مثال: ۳۵"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">آلرژی‌ها</label>
          <TagInput value={allergies} onChange={setAllergies} placeholder="مثال: پنی‌سیلین" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">داروهای ثابت</label>
          <TagInput value={chronicMeds} onChange={setChronicMeds} placeholder="مثال: آتنولول" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">یادداشت</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="توضیحات اختیاری"
            className="rounded-2xl"
          />
        </div>
        <Button className="w-full rounded-full" onClick={save}>
          ذخیره
        </Button>
        <p className="text-xs text-muted">آخرین به‌روزرسانی: {formatDate(savedAt)}</p>
      </Card>
    </div>
  );
}
