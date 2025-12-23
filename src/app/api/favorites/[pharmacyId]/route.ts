import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { pharmacyId: string } }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await prisma.favorite.upsert({
    where: { userId_pharmacyId: { userId: user.id, pharmacyId: params.pharmacyId } },
    create: { userId: user.id, pharmacyId: params.pharmacyId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { pharmacyId: string } }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await prisma.favorite.deleteMany({ where: { userId: user.id, pharmacyId: params.pharmacyId } });
  return NextResponse.json({ ok: true });
}
