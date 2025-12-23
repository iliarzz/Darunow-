import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { phone, code, name } = await request.json().catch(() => ({}));
  const expected = process.env.OTP_STATIC_CODE || "123456";
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  if (!code || code !== expected) {
    return NextResponse.json({ error: "invalid code" }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { phone },
    update: { name: typeof name === "string" ? name : undefined },
    create: { phone, name: typeof name === "string" ? name : undefined },
  });
  const token = signSession({ userId: user.id, phone });
  const res = NextResponse.json({ token, user });
  res.cookies.set("session", token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
