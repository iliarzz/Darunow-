import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  adjustInventory,
  createInventoryItem,
  listInventory,
  type InventoryItem,
} from "@/lib/portal/server-store";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

export async function GET(req: NextRequest) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ inventory: listInventory() });
}

export async function POST(req: NextRequest) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Partial<InventoryItem> & { delta?: number };

  if (!body.productId) {
    return NextResponse.json({ error: "شناسه کالا الزامی است" }, { status: 400 });
  }

  try {
    if (typeof body.delta === "number") {
      const item = adjustInventory(body.productId, body.delta);
      return NextResponse.json({ item });
    }

    const item = createInventoryItem({
      productId: body.productId,
      name: body.name ?? body.productId,
      stock: Number(body.stock ?? 0),
      strength: body.strength,
      form: body.form,
      lowStockThreshold: body.lowStockThreshold,
      expiresAt: body.expiresAt,
      supplier: body.supplier,
      category: body.category,
      reorderRequested: body.reorderRequested,
      lastUpdatedBy: auth.payload.role,
      lastUpdatedAt: Date.now(),
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "ثبت کالا انجام نشد" }, { status: 400 });
  }
}
