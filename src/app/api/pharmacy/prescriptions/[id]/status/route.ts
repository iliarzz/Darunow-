import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPharmacySession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import type { PrescriptionStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const allowed: PrescriptionStatus[] = ["needs_fix", "approved", "review"];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getPharmacySession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { status } = await req.json().catch(() => ({}));
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  const rx = await prisma.prescription.findFirst({
    where: { id: params.id, pharmacyId: session.session.pharmacyId },
  });
  if (!rx) return NextResponse.json({ error: "not found" }, { status: 404 });
  const updated = await prisma.prescription.update({
    where: { id: rx.id },
    data: { status },
  });
  await logAudit({
    actorType: "pharmacy",
    actorId: session.session.userId,
    action: "prescription_status",
    entityType: "prescription",
    entityId: rx.id,
    before: { status: rx.status },
    after: { status },
  });
  await createNotification({
    userId: rx.userId,
    type: status === "approved" ? "rx_approved" : "rx_needs_fix",
    title: "وضعیت نسخه",
    body: status === "approved" ? "نسخه تایید شد." : "نسخه نیاز به اصلاح دارد.",
    meta: { prescriptionId: rx.id, orderId: rx.orderId },
  });
  return NextResponse.json(updated);
}
