import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ratings = await prisma.rating.findMany({ where: { userId: user.id } });
  return NextResponse.json(ratings);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId, pharmacyId, score, note } = await req.json().catch(() => ({}));
  if (!orderId || !pharmacyId || typeof score !== "number") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id } });
  if (!order) return NextResponse.json({ error: "order not found" }, { status: 404 });
  const rating = await prisma.rating.upsert({
    where: { orderId_userId: { orderId, userId: user.id } },
    update: { pharmacyId, score, note: note ?? null },
    create: { userId: user.id, orderId, pharmacyId, score, note: note ?? null },
  });
  return NextResponse.json(rating, { status: 201 });
}
