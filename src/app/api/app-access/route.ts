import { NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "app_access";

export async function POST(req: Request) {
  const accessCode = process.env.APP_ACCESS_CODE ?? "";
  if (!accessCode) {
    return NextResponse.json({ error: "کد دسترسی تنظیم نشده است." }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code || code !== accessCode) {
    return NextResponse.json({ error: "کد دسترسی نامعتبر است." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE_NAME, accessCode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
