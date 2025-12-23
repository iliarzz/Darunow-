"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTickets, addTicketReply } from "@/stores/tickets";
import { formatDate, formatTime } from "@/lib/format";

export default function TicketThreadPage() {
  const { id } = useParams<{ id: string }>();
  const tickets = useTickets();
  const ticket = useMemo(() => tickets.find((t) => t.id === id), [tickets, id]);
  const [reply, setReply] = useState("");
  const router = useRouter();

  if (!ticket) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">تیکت پیدا نشد.</p>
        <Button variant="ghost" onClick={() => router.push("/support")}>
          بازگشت
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{ticket.subject}</h1>
          <p className="text-xs text-muted">
            {formatDate(ticket.createdAt)} • {formatTime(ticket.createdAt)}
          </p>
        </div>
        <Badge variant={ticket.status === "open" ? "info" : ticket.status === "answered" ? "success" : "neutral"}>
          {ticket.status === "open" ? "باز" : ticket.status === "answered" ? "پاسخ داده شد" : "بسته"}
        </Badge>
      </div>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-semibold text-text">پیام اولیه</p>
        <p className="text-sm text-text/80">{ticket.message}</p>
        {ticket.orderId && <Badge variant="outline">سفارش مرتبط: {ticket.orderId}</Badge>}
      </Card>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-semibold text-text">گفتگو</p>
        <div className="space-y-2">
          {ticket.replies.length === 0 && <p className="text-xs text-muted">هنوز پاسخی نیست.</p>}
          {ticket.replies.map((r, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-surface-1 p-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{r.from === "support" ? "پشتیبانی" : "شما"}</span>
                <span>
                  {formatDate(r.at)} • {formatTime(r.at)}
                </span>
              </div>
              <p className="mt-1 text-sm text-text/80">{r.text}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">پاسخ شما</label>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} className="rounded-2xl" rows={3} placeholder="متن کوتاه..." />
          <Button
            className="rounded-full"
            onClick={async () => {
              if (!reply) return;
              await addTicketReply(ticket.id, "user", reply);
              setReply("");
            }}
          >
            ارسال پاسخ
          </Button>
        </div>
      </Card>
    </div>
  );
}
