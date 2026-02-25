import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { normalizeOrderForPortal } from "@/lib/portal/normalize-order";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";
import { reviewPrescription } from "@/lib/orders/store";

type ReviewStatus = "PENDING_REVIEW" | "NEED_CLARIFICATION" | "APPROVED" | "REJECTED" | "FULFILLED";
const allowedReviewStatuses: ReviewStatus[] = ["PENDING_REVIEW", "NEED_CLARIFICATION", "APPROVED", "REJECTED", "FULFILLED"];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { reviewStatus?: string; note?: string };
  const reviewStatus = body.reviewStatus as ReviewStatus;

  if (!reviewStatus || !allowedReviewStatuses.includes(reviewStatus)) {
    return NextResponse.json({ error: "وضعیت بررسی نسخه معتبر نیست" }, { status: 400 });
  }

  try {
    const order = reviewPrescription(params.id, reviewStatus, {
      note: body.note,
      reviewedBy: auth.payload.role,
    });
    if (!order) {
      return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ order: normalizeOrderForPortal(order) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "درخواست نامعتبر" }, { status: 400 });
  }
}
