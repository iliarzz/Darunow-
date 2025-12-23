import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPharmacySession } from "@/lib/auth";
import { mapOrderToDto } from "@/lib/server-mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const session = await getPharmacySession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { pharmacyId: session.session.pharmacyId },
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders.map(mapOrderToDto));
}
