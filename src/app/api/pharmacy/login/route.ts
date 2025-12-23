import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signPharmacySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  const { phone, email, code } = await req.json().catch(() => ({}));
  const expected = process.env.OTP_STATIC_CODE || "123456";
  if (!code || code !== expected) {
    return NextResponse.json({ error: "invalid code" }, { status: 401 });
  }
  const user = await prisma.pharmacyUser.findFirst({
    where: {
      OR: [
        phone ? { phone } : undefined,
        email ? { email } : undefined,
      ].filter(Boolean) as any,
    },
  });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  const token = signPharmacySession({ pharmacyId: user.pharmacyId, userId: user.id, role: user.role });
  const res = NextResponse.json({ token, user });
  res.cookies.set("pharmacy_session", token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
