import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { acceptOrder } from "@/lib/orders/store";
import { normalizeOrderForPortal } from "@/lib/portal/normalize-order";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { etaMinutes?: number };

  try {
    const order = acceptOrder(params.id, typeof body.etaMinutes === "number" ? body.etaMinutes : undefined);
    if (!order) {
      return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ order: normalizeOrderForPortal(order) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "درخواست نامعتبر" }, { status: 400 });
  }
}
