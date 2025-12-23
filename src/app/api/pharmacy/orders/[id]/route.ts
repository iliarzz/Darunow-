import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPharmacySession } from "@/lib/auth";
import { mapOrderToDto } from "@/lib/server-mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getPharmacySession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const order = await prisma.order.findFirst({
    where: { id: params.id, pharmacyId: session.session.pharmacyId },
    include: { orderItems: true, prescriptions: true, substitutionProposals: true },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    order: mapOrderToDto(order),
    prescriptions: order.prescriptions,
    proposals: order.substitutionProposals,
  });
}
