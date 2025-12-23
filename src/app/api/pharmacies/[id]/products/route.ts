import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const products = await prisma.product.findMany({
    where: { pharmacyId: params.id },
    orderBy: { createdAt: "desc" },
  });
  const mapped = products.map((p) => ({
    id: p.id,
    pharmacyId: p.pharmacyId,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    inStock: p.inStock,
    description: p.description,
    category: p.category,
  }));
  return NextResponse.json(mapped);
}
