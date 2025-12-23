import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  const favorites = user
    ? await prisma.favorite.findMany({ where: { userId: user.id }, select: { pharmacyId: true } })
    : [];
  const list = await prisma.pharmacy.findMany({ orderBy: { createdAt: "desc" } });
  const mapped = list.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    isOpen: p.isOpen,
    deliveryEtaMin: p.deliveryEtaMin,
    deliveryEtaMax: p.deliveryEtaMax,
    tags: p.tags,
    rating: p.rating,
    addressShort: p.addressShort,
    coverStyle: (p.coverStyle as any) ?? "gradient",
    isFavorite: favorites.some((f) => f.pharmacyId === p.id),
  }));
  return NextResponse.json(mapped);
}
