"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { listTickets } from "@/stores/tickets";
import { formatDate, formatTime } from "@/lib/format";

export default function SupportInboxPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(listTickets());

  useEffect(() => {
    setTickets(listTickets());
    setLoading(false);
  }, []);

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">پشتیبانی</h1>
          <p className="text-sm text-muted">تیکت‌های باز و پاسخ‌ها</p>
        </div>
        <Button asChild className="rounded-full px-4">
          <Link href="/support/new">تیکت جدید</Link>
        </Button>
      </div>
      {loading ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : tickets.length === 0 ? (
        <EmptyState title="تیکتی ثبت نشده." action={{ label: "تیکت جدید", href: "/support/new" }} />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-text">{t.subject}</p>
                <p className="text-xs text-muted">
                  {formatDate(t.createdAt)} • {formatTime(t.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.status === "open" ? "info" : t.status === "answered" ? "success" : "neutral"}>
                  {t.status === "open" ? "باز" : t.status === "answered" ? "پاسخ داده شد" : "بسته"}
                </Badge>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/support/${t.id}`}>مشاهده</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
