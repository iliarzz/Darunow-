import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { mapOrderToDto } from "@/lib/server-mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const opsKey = process.env.OPS_ADMIN_KEY;
  const providedKey = req.headers.get("x-ops-key") ?? req.nextUrl.searchParams.get("opsKey");
  if (opsKey && providedKey === opsKey) {
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { orderItems: true } });
    if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(mapOrderToDto(order));
  }
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: { orderItems: true },
  });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(mapOrderToDto(order));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const opsKey = process.env.OPS_ADMIN_KEY;
  const providedKey = req.headers.get("x-ops-key") ?? req.nextUrl.searchParams.get("opsKey");
  if (opsKey && providedKey !== opsKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { status, notes } = await req.json().catch(() => ({}));
  if (!status || !Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  const existing = await prisma.order.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  const timeline = Array.isArray(existing.timeline)
    ? (existing.timeline as any[]).filter((t) => t && t.status && typeof t.at !== "undefined")
    : [];
  const now = Date.now();
  const filtered = timeline.filter((t: any) => t.status !== status);
  const nextTimeline = [...filtered, { status, at: now }].sort((a, b) => (a?.at ?? 0) - (b?.at ?? 0));
  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: status as any,
      notes: notes ?? existing.notes,
      timeline: nextTimeline,
    },
    include: { orderItems: true },
  });
  return NextResponse.json(mapOrderToDto(order));
}
