import { NextRequest, NextResponse } from "next/server";
import { PaymentType, SubstitutionPref } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { mapOrderToDto } from "@/lib/server-mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const opsKeyHeader = req.headers.get("x-ops-key");
  const opsQuery = req.nextUrl.searchParams.get("opsKey");
  const opsKey = process.env.OPS_ADMIN_KEY;
  if (opsKey && (opsKeyHeader === opsKey || opsQuery === opsKey)) {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { orderItems: true },
    });
    return NextResponse.json(orders.map(mapOrderToDto));
  }
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { orderItems: true },
  });
  return NextResponse.json(orders.map(mapOrderToDto));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }
  if (!body.pharmacyId) return NextResponse.json({ error: "pharmacyId required" }, { status: 400 });
  const subtotal = Number(body.subtotal ?? 0);
  const deliveryFee = Number(body.deliveryFee ?? 0);
  const discount = Number(body.discount ?? 0);
  const payable = Number(body.payable ?? subtotal + deliveryFee - discount);
  const now = Date.now();
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      pharmacyId: body.pharmacyId,
      status: "preparing",
      subtotal,
      discount,
      deliveryFee,
      payable,
      paymentType: (body.paymentType as PaymentType) ?? "online",
      substitutionPref: (body.substitution ?? "similarAllowed") as SubstitutionPref,
      notes: body.notes ?? null,
      addressId: body.addressId ?? null,
      deliverySlotId: body.deliverySlotId ?? null,
      timeline: [
        { status: "created", at: now },
        { status: "preparing", at: now },
      ],
      orderItems: {
        create: body.items.map((item: any) => ({
          productId: item.id ?? item.productId ?? null,
          name: item.name,
          price: item.price,
          qty: item.qty ?? 1,
          subtitle: item.subtitle ?? null,
        })),
      },
    },
    include: { orderItems: true },
  });
  return NextResponse.json(mapOrderToDto(order), { status: 201 });
}
