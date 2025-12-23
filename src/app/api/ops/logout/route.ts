import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", { httpOnly: true, expires: new Date(0) });
  return res;
}
