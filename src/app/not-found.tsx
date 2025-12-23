"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="space-y-4 pb-16">
      <EmptyState
        title="صفحه پیدا نشد."
        description="ممکن است آدرس جابه‌جا شده باشد. برگردیم به خانه؟"
        icon={<AlertCircle className="h-5 w-5 text-accent-500" />}
      />
      <div className="flex gap-2">
        <Button asChild variant="primary">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/pharmacies">جستجوی داروخانه</Link>
        </Button>
      </div>
    </div>
  );
}
