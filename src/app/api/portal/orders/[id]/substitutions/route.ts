import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { addSubstitution } from "@/lib/orders/store";
import { normalizeOrderForPortal } from "@/lib/portal/normalize-order";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    proposal?: {
      originalItemId?: string;
      suggestedName?: string;
      suggestedUnitPrice?: number;
      reason?: string;
    };
  };

  const proposal = body.proposal;
  if (!proposal?.originalItemId || !proposal?.suggestedName || typeof proposal.suggestedUnitPrice !== "number") {
    return NextResponse.json({ error: "اطلاعات جایگزینی ناقص است" }, { status: 400 });
  }

  try {
    const order = addSubstitution(params.id, {
      originalItemId: proposal.originalItemId,
      suggestedName: proposal.suggestedName,
      suggestedUnitPrice: proposal.suggestedUnitPrice,
      reason: proposal.reason,
    });
    if (!order) {
      return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ order: normalizeOrderForPortal(order) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "درخواست نامعتبر" }, { status: 400 });
  }
}
