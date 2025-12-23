"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatMoney, formatOrderId } from "@/lib/format";
import type { Order } from "@/lib/types-v2";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type DetailResponse = { order: Order; prescriptions?: any[]; proposals?: any[] };

export default function PharmacyOrderDetail() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subName, setSubName] = useState("");
  const [priceDelta, setPriceDelta] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pharmacy/orders/${params.id}`);
        if (!res.ok) throw new Error("failed");
        setData(await res.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const order = data?.order;

  const changeStatus = async (status: string) => {
    try {
      await fetch(`/api/pharmacy/orders/${params.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast({ title: "وضعیت بروزرسانی شد" });
      router.refresh();
    } catch {
      toast({ title: "بروزرسانی انجام نشد" });
    }
  };

  const propose = async () => {
    if (!order) return;
    const firstItem = order.items[0];
    await fetch(`/api/pharmacy/orders/${order.id}/substitution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          {
            orderItemId: (firstItem as any)?.orderItemId ?? firstItem?.productId,
            originalName: firstItem?.name,
            proposedName: subName || firstItem?.name,
            priceDelta: Number(priceDelta) || 0,
          },
        ],
      }),
    });
    toast({ title: "پیشنهاد ارسال شد" });
    router.refresh();
  };

  const approveRx = async (rxId: string, status: "approved" | "needs_fix") => {
    await fetch(`/api/pharmacy/prescriptions/${rxId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast({ title: "وضعیت نسخه بروزرسانی شد" });
  };

  if (loading || !order) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">سفارش {formatOrderId(order.id)}</h1>
          <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant="info">{order.status}</Badge>
      </div>

      <Card className="space-y-2 border border-border/70 p-4">
        <p className="text-sm font-semibold text-text">اقلام</p>
        {order.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm">
            <span>{item.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant="neutral">×{item.qty}</Badge>
              <span>{formatMoney(item.price * item.qty)}</span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm text-muted">
          <span>جمع</span>
          <span>{formatMoney(order.payable ?? order.total)}</span>
        </div>
      </Card>

      {data?.prescriptions && data.prescriptions.length > 0 && (
        <Card className="space-y-3 border border-border/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text">نسخه</p>
            <Badge variant="outline">{translatePrescriptionStatus(data.prescriptions[0].status)}</Badge>
          </div>
          <p className="text-xs text-muted">پیش‌نمایش نسخه در دسترس نیست.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => approveRx(data.prescriptions![0].id, "approved")}>
              تایید نسخه
            </Button>
            <Button size="sm" variant="secondary" onClick={() => approveRx(data.prescriptions![0].id, "needs_fix")}>
              نیاز به اصلاح
            </Button>
          </div>
        </Card>
      )}

      <Card className="space-y-3 border border-border/70 p-4">
        <p className="text-sm font-semibold text-text">پیشنهاد جایگزین</p>
        <div className="grid gap-2 md:grid-cols-2">
          <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="نام جایگزین" className="rounded-full" />
          <Input
            type="number"
            value={priceDelta}
            onChange={(e) => setPriceDelta(Number(e.target.value))}
            placeholder="تفاوت قیمت"
            className="rounded-full"
          />
        </div>
        <Textarea rows={2} placeholder="توضیح (اختیاری)" />
        <Button onClick={propose}>ارسال به کاربر</Button>
      </Card>

      {data?.proposals && data.proposals.length > 0 && (
        <Card className="space-y-3 border border-border/70 p-4">
          <p className="text-sm font-semibold text-text">پیشنهادهای ارسال شده</p>
          {data.proposals.map((p) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-border/50 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>وضعیت</span>
                <Badge variant="outline">{translateProposalStatus(p.status)}</Badge>
              </div>
              {Array.isArray(p.items) &&
                p.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-2/70 p-2">
                    <div>
                      <p className="font-semibold">{it.proposedName ?? it.originalName}</p>
                      <p className="text-xs text-muted">اصلی: {it.originalName}</p>
                    </div>
                    <Badge variant="neutral">
                      {it.priceDelta > 0 ? `+${formatMoney(it.priceDelta)}` : it.priceDelta < 0 ? formatMoney(it.priceDelta) : "بدون تغییر"}
                    </Badge>
                  </div>
                ))}
            </div>
          ))}
        </Card>
      )}

      <Card className="space-y-3 border border-border/70 p-4">
        <p className="text-sm font-semibold text-text">اقدامات</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => changeStatus("preparing")}>
            شروع آماده‌سازی
          </Button>
          <Button size="sm" onClick={() => changeStatus("shipped")}>
            ارسال شد
          </Button>
          <Button size="sm" variant="secondary" onClick={() => changeStatus("delivered")}>
            تحویل شد
          </Button>
        </div>
      </Card>
    </div>
  );
}

function translatePrescriptionStatus(status: string) {
  switch (status) {
    case "approved":
      return "تایید شده";
    case "needs_fix":
      return "نیاز به اصلاح";
    case "review":
      return "در حال بررسی";
    case "received":
      return "دریافت شد";
    default:
      return status;
  }
}

function translateProposalStatus(status: string) {
  switch (status) {
    case "pending":
      return "در انتظار تایید";
    case "accepted":
      return "تایید شده";
    case "rejected":
      return "رد شده";
    default:
      return status;
  }
}
