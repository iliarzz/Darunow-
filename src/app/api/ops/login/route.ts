import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  const { email, password, code } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const expectedCode = process.env.OTP_STATIC_CODE || "123456";
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return NextResponse.json({ error: "not found" }, { status: 404 });

  const passwordOk =
    (password && admin.passwordHash && password === admin.passwordHash) || (code && code === expectedCode);
  if (!passwordOk) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });

  const token = signAdminSession({ userId: admin.id, role: admin.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
