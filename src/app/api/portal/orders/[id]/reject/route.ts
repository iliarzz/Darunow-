import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { normalizeOrderForPortal } from "@/lib/portal/normalize-order";
import { rejectOrder } from "@/lib/orders/store";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { reason?: string };

  try {
    const order = rejectOrder(params.id, body.reason || "عدم امکان تامین");
    if (!order) {
      return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ order: normalizeOrderForPortal(order) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "درخواست نامعتبر" }, { status: 400 });
  }
}
