import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders/store";
import { normalizeOrderForPortal } from "@/lib/portal/normalize-order";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });
  }

  return NextResponse.json({ order: normalizeOrderForPortal(order) });
}
