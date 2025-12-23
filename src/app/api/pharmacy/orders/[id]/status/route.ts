import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPharmacySession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import type { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  created: ["rx_received", "rx_review", "cancelled"],
  rx_received: ["rx_review", "cancelled"],
  rx_review: ["approved", "cancelled"],
  approved: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered", "refund_requested"],
  delivered: ["refund_requested"],
  refund_requested: ["refunding"],
  refunding: ["refunded"],
  refunded: [],
  cancelled: [],
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getPharmacySession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { status } = await req.json().catch(() => ({}));
  if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });
  const order = await prisma.order.findFirst({
    where: { id: params.id, pharmacyId: session.session.pharmacyId },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  const next: OrderStatus = status;
  const allowed = allowedTransitions[order.status as OrderStatus] ?? [];
  if (!allowed.includes(next)) {
    return NextResponse.json({ error: "transition not allowed" }, { status: 400 });
  }
  const now = Date.now();
  const timeline = Array.isArray(order.timeline) ? (order.timeline as any[]) : [];
  const updatedTimeline = [...timeline.filter((t) => t?.status !== next), { status: next, at: now }].sort(
    (a, b) => (a?.at ?? 0) - (b?.at ?? 0),
  );
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: next, timeline: updatedTimeline },
  });
  await logAudit({
    actorType: "pharmacy",
    actorId: session.session.userId,
    action: "order_status_update",
    entityType: "order",
    entityId: order.id,
    before: { status: order.status },
    after: { status: next },
  });
  await createNotification({
    userId: updated.userId,
    type: "order_status_updated",
    title: "بروزرسانی وضعیت سفارش",
    body: `وضعیت سفارش به ${next} تغییر کرد`,
    meta: { orderId: order.id, status: next },
  });
  return NextResponse.json({ ok: true });
}
