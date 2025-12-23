import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { phone } = await request.json().catch(() => ({ phone: undefined }));
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  const code = process.env.OTP_STATIC_CODE || "123456";
  return NextResponse.json({ ok: true, code });
}
