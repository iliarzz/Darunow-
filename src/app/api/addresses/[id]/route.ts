import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const address = await prisma.address.findFirst({ where: { id: params.id, userId: user.id } });
  if (!address) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    ...address,
    createdAt: address.createdAt.getTime(),
    updatedAt: address.updatedAt.getTime(),
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await req.json().catch(() => ({}));
  const target = await prisma.address.findFirst({ where: { id: params.id, userId: user.id } });
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  const wantsDefault = data.isDefault === true;
  if (wantsDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  const updated = await prisma.address.update({
    where: { id: params.id },
    data: {
      label: data.label ?? target.label,
      recipientName: data.recipientName ?? target.recipientName,
      phone: data.phone ?? target.phone,
      province: data.province ?? target.province,
      city: data.city ?? target.city,
      line1: data.line1 ?? target.line1,
      line2: data.line2 ?? target.line2,
      postalCode: data.postalCode ?? target.postalCode,
      isDefault: wantsDefault ? true : data.isDefault ?? target.isDefault,
    },
  });
  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.getTime(),
    updatedAt: updated.updatedAt.getTime(),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  await prisma.address.delete({ where: { id: params.id } });
  const remaining = await prisma.address.findMany({ where: { userId: user.id } });
  if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
    await prisma.address.update({ where: { id: remaining[0].id }, data: { isDefault: true } });
  }
  return NextResponse.json({ ok: true });
}
