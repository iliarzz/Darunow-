import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";
import { updateInventoryItem, type InventoryItem } from "@/lib/portal/server-store";

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<InventoryItem>;

  try {
    const item = updateInventoryItem(params.productId, {
      ...body,
      productId: params.productId,
      lastUpdatedBy: auth.payload.role,
      lastUpdatedAt: Date.now(),
    });
    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "بروزرسانی انجام نشد" }, { status: 400 });
  }
}
