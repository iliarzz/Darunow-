"use client";

import { Suspense, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Ticket } from "@/lib/types-v2";
import { formatDate, formatTime } from "@/lib/format";

const statuses: Ticket["status"][] = ["open", "answered", "closed"];

export default function OpsTicketsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">در حال بارگذاری...</p>}>
      <TicketsContent />
    </Suspense>
  );
}

function TicketsContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/tickets`);
        if (!res.ok) throw new Error("failed");
        setTickets(await res.json());
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const updateStatus = async (id: string, status: Ticket["status"]) => {
    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("به‌روزرسانی انجام نشد");
      return;
    }
    const updated: Ticket = await res.json();
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">OPS / Tickets</h1>
        <Badge variant="outline">{tickets.length} مورد</Badge>
      </div>
      {loading && <p className="text-sm text-muted">در حال بارگذاری...</p>}
      {error && <p className="text-sm text-warning">{error}</p>}
      <div className="space-y-3">
        {tickets.map((t) => (
          <Card key={t.id} className="space-y-2 border border-border/70 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text">{t.subject}</p>
                <p className="text-xs text-muted">
                  {formatDate(t.createdAt)} • {formatTime(t.createdAt)}
                </p>
              </div>
              <select
                value={t.status}
                onChange={(e) => updateStatus(t.id, e.target.value as Ticket["status"])}
                className="rounded-full border border-border px-3 py-1 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {t.orderId && <Badge variant="neutral">سفارش: {t.orderId}</Badge>}
            <p className="text-sm text-text/80">{t.message}</p>
            <div className="space-y-1 rounded-2xl border border-dashed border-border/60 bg-surface-1 p-3 text-xs text-muted">
              {t.replies.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span>{r.from === "support" ? "پشتیبانی" : "کاربر"}</span>
                  <span>
                    {formatDate(r.at)} {formatTime(r.at)}
                  </span>
                </div>
              ))}
              {t.replies.length === 0 && <p className="text-muted">بدون پاسخ</p>}
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <a href={`/support/${t.id}`} target="_blank" rel="noreferrer">
                  مشاهده کاربر
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
