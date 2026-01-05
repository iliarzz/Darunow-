import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_TTL_MS, createAdminSessionToken } from "@/lib/admin-session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const expectedUser = process.env.ADMIN_USER ?? "";
  const expectedPass = process.env.ADMIN_PASS ?? "";
  if (!expectedUser || !expectedPass) {
    return NextResponse.json({ error: "Admin credentials not configured." }, { status: 500 });
  }

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: "نام کاربری یا رمز عبور صحیح نیست." }, { status: 401 });
  }

  const secret = process.env.ADMIN_SESSION_SECRET ?? expectedPass;
  const token = await createAdminSessionToken({ username: expectedUser, secret, ttlMs: ADMIN_SESSION_TTL_MS });

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/coming-soon/admin",
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });
  return response;
}
