"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/stores/tickets";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/stores/orders";
import { StatusPill } from "@/components/orders/status-pill";
import { track } from "@/lib/track";

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pb-16">
          <div className="h-6 w-32 rounded-full bg-surface-3" />
          <div className="space-y-2 rounded-2xl border border-border bg-surface-1 p-4">
            <div className="h-4 w-24 rounded-full bg-surface-3" />
            <div className="h-12 w-full rounded-2xl bg-surface-3" />
          </div>
        </div>
      }
    >
      <NewTicketContent />
    </Suspense>
  );
}

function NewTicketContent() {
  const router = useRouter();
  const search = useSearchParams();
  const orderIdPrefill = search?.get("orderId") ?? "";
  const orders = useOrders();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(orderIdPrefill);
  const { toast } = useToast();

  const submit = () => {
    if (!subject || !message) {
      toast({ title: "اطلاعات لازم است", description: "موضوع و متن را وارد کن." });
      return;
    }
    createTicket({
      subject,
      message,
      orderId: orderId || undefined,
    });
    track("ticket_created", { orderId: orderId || null });
    toast({ title: "تیکت ثبت شد", description: "پاسخ پشتیبانی به زودی ارسال می‌شود." });
    router.push("/support");
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">تیکت جدید</h1>
          <p className="text-sm text-muted">پرسش خود را بنویس.</p>
        </div>
        <Button variant="ghost" className="rounded-full px-4" onClick={() => router.back()}>
          بازگشت
        </Button>
      </div>
      <Card className="space-y-4 p-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">موضوع</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-full" placeholder="مثال: وضعیت سفارش" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">متن پیام</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="توضیح کوتاه"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text">انتخاب سفارش (اختیاری)</label>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between rounded-full">
                <span>{orderId ? `سفارش ${orderId}` : "انتخاب سفارش مرتبط"}</span>
                <Badge variant="outline">فهرست سفارش‌ها</Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>انتخاب سفارش</SheetTitle>
              </SheetHeader>
              <div className="mt-3 space-y-2">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    className="w-full rounded-2xl border border-border px-3 py-2 text-right transition hover:border-brand"
                    onClick={() => {
                      setOrderId(o.id);
                    }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>سفارش {o.id}</span>
                      <StatusPill status={o.status} />
                    </div>
                  </button>
                ))}
                {orders.length === 0 && <p className="text-xs text-muted">سفارشی ثبت نشده.</p>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Button className="w-full rounded-full" onClick={submit}>
          ثبت تیکت
        </Button>
      </Card>
    </div>
  );
}
