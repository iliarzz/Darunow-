import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { decision } = await req.json().catch(() => ({}));
  if (!["accepted", "rejected"].includes(decision)) {
    return NextResponse.json({ error: "invalid decision" }, { status: 400 });
  }
  const proposal = await prisma.substitutionProposal.findUnique({
    where: { id: params.id },
    include: { order: true },
  });
  if (!proposal || proposal.order.userId !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const updated = await prisma.substitutionProposal.update({
    where: { id: proposal.id },
    data: { status: decision as any, respondedAt: new Date() },
  });
  await logAudit({
    actorType: "user",
    actorId: user.id,
    action: "substitution_response",
    entityType: "proposal",
    entityId: proposal.id,
    before: { status: proposal.status },
    after: { status: updated.status },
  });
  await createNotification({
    userId: proposal.order.userId,
    type: "substitution_response",
    title: "پاسخ به جایگزین",
    body: decision === "accepted" ? "پیشنهاد جایگزین تایید شد." : "پیشنهاد جایگزین رد شد.",
    meta: { proposalId: proposal.id, orderId: proposal.orderId },
  });
  return NextResponse.json(updated);
}
