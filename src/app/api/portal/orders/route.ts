import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders/store";
import { normalizeOrderForPortal } from "@/lib/portal/normalize-order";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

export async function GET(req: NextRequest) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const type = searchParams.get("type")?.trim().toLowerCase() ?? "";
  const payment = searchParams.get("payment")?.trim().toUpperCase() ?? "";

  const all = listOrders().map(normalizeOrderForPortal);

  const filtered = all
    .filter((order) => {
      if (!q) return true;
      const searchable = [
        order.id,
        order.customerName,
        order.customerPhone ?? "",
        order.deliveryAddressText,
        ...order.items.map((item) => item.name),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    })
    .filter((order) => {
      if (!type) return true;
      const normalizedType = type === "prescription" ? "PRESCRIPTION" : type === "standard" ? "STANDARD" : "";
      return normalizedType ? order.type === normalizedType : true;
    })
    .filter((order) => {
      if (!payment) return true;
      return order.paymentMethod === payment;
    });

  return NextResponse.json({ orders: filtered });
}
