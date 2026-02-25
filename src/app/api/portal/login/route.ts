import { NextResponse } from "next/server";
import {
  PORTAL_COOKIE_NAME,
  PORTAL_SESSION_TTL_SECONDS,
  authenticatePortalUser,
  createPortalSessionToken,
  listPortalDemoAccounts,
  toPortalSession,
} from "@/lib/portal/session";

export async function GET() {
  return NextResponse.json({
    accounts: listPortalDemoAccounts(),
    usesCustomPassword: Boolean(process.env.PORTAL_DEMO_PASSWORD),
  });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "نام کاربری و رمز عبور الزامی است" }, { status: 400 });
  }

  const payload = authenticatePortalUser(username, password);
  if (!payload) {
    return NextResponse.json({ error: "اطلاعات ورود نادرست است" }, { status: 401 });
  }

  const token = createPortalSessionToken(payload);
  const res = NextResponse.json(toPortalSession(payload));
  res.cookies.set(PORTAL_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PORTAL_SESSION_TTL_SECONDS,
  });
  return res;
}
