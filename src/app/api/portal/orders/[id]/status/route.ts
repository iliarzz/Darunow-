import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { normalizeOrderForPortal } from "@/lib/portal/normalize-order";
import { updateOrderStatus } from "@/lib/orders/store";
import type { OrderStatus } from "@/lib/orders/types";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

const allowedStatuses: OrderStatus[] = [
  "PLACED",
  "PHARMACY_REVIEW",
  "PHARMACY_ACCEPTED",
  "PHARMACY_REJECTED",
  "PREPARING",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "DELIVERED",
  "CANCELED",
];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { nextStatus?: string };
  const nextStatus = body.nextStatus as OrderStatus;

  if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
  }

  try {
    const order = updateOrderStatus(params.id, nextStatus);
    if (!order) {
      return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ order: normalizeOrderForPortal(order) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "درخواست نامعتبر" }, { status: 400 });
  }
}
