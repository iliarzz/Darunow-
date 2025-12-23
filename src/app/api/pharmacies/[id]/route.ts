import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const pharmacy = await prisma.pharmacy.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!pharmacy) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    id: pharmacy.id,
    slug: pharmacy.slug,
    name: pharmacy.name,
    isOpen: pharmacy.isOpen,
    deliveryEtaMin: pharmacy.deliveryEtaMin,
    deliveryEtaMax: pharmacy.deliveryEtaMax,
    tags: pharmacy.tags,
    rating: pharmacy.rating,
    addressShort: pharmacy.addressShort,
    coverStyle: (pharmacy.coverStyle as any) ?? "gradient",
    city: pharmacy.city,
  });
}
