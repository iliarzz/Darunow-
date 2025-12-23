"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatTime } from "@/lib/format";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: number;
  readAt?: number | null;
};

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications?markRead=1");
        const data = await res.json();
        setList(data);
      } finally {
        setLoading(false);
        void fetch("/api/notifications/read", { method: "POST" }).catch(() => {});
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4 pb-16">
      <h1 className="text-2xl font-bold text-text">اعلان‌ها</h1>
      {loading && <Skeleton className="h-10 w-full rounded-xl" />}
      {!loading && list.length === 0 && <EmptyState title="اعلان ندارید." />}
      <div className="space-y-3">
        {list.map((n) => (
          <Card key={n.id} className="space-y-1 border border-border/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text">{n.title}</p>
              <Badge variant="outline">{n.type}</Badge>
            </div>
            <p className="text-sm text-muted">{n.body}</p>
            <p className="text-[11px] text-muted">
              {formatDate(n.createdAt)} • {formatTime(n.createdAt)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
