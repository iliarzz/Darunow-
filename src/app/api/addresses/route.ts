import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const addresses = await prisma.address
    .findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    })
    .then((rows) =>
      rows.map((a) => ({
        ...a,
        createdAt: a.createdAt.getTime(),
        updatedAt: a.updatedAt.getTime(),
      })),
    );
  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await req.json().catch(() => ({}));
  const required = ["label", "recipientName", "phone", "province", "city", "line1"];
  if (required.some((k) => !data?.[k])) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const wantsDefault = Boolean(data.isDefault);
  if (wantsDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  const created = await prisma.address.create({
    data: {
      userId: user.id,
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      province: data.province,
      city: data.city,
      line1: data.line1,
      line2: data.line2 ?? null,
      postalCode: data.postalCode ?? null,
      isDefault: wantsDefault,
    },
  });
  return NextResponse.json(
    { ...created, createdAt: created.createdAt.getTime(), updatedAt: created.updatedAt.getTime() },
    { status: 201 },
  );
}
