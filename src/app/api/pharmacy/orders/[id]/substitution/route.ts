import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPharmacySession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getPharmacySession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { items, note } = await req.json().catch(() => ({}));
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }
  const order = await prisma.order.findFirst({
    where: { id: params.id, pharmacyId: session.session.pharmacyId },
    include: { orderItems: true },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  const created = await prisma.substitutionProposal.create({
    data: {
      orderId: order.id,
      pharmacyId: order.pharmacyId,
      status: "pending",
      items: items as any,
      proposalItems: {
        create: items.map((it: any) => ({
          orderItemId: it.orderItemId ?? order.orderItems[0]?.id,
          originalName: it.originalName ?? "مورد",
          proposedName: it.proposedName ?? it.originalName ?? "جایگزین",
          priceDelta: it.priceDelta ?? 0,
          note: it.note ?? note ?? null,
        })),
      },
    },
  });

  await logAudit({
    actorType: "pharmacy",
    actorId: session.session.userId,
    action: "substitution_proposed",
    entityType: "order",
    entityId: order.id,
    before: {},
    after: { proposalId: created.id },
  });

  await createNotification({
    userId: order.userId,
    type: "substitution_proposed",
    title: "پیشنهاد جایگزین",
    body: "داروخانه پیشنهاد جایگزین برای سفارش داده است.",
    meta: { orderId: order.id, proposalId: created.id },
  });

  return NextResponse.json({ ok: true, proposalId: created.id }, { status: 201 });
}
