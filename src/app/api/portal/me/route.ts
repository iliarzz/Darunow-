import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/portal/route-auth";

export async function GET(req: NextRequest) {
  const auth = getPortalSessionFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(auth.session);
}
