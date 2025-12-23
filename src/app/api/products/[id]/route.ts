import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    id: product.id,
    pharmacyId: product.pharmacyId,
    name: product.name,
    subtitle: product.subtitle,
    price: product.price,
    inStock: product.inStock,
    description: product.description,
    category: product.category,
  });
}
