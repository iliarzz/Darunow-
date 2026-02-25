import type { NextRequest } from "next/server";
import { PORTAL_COOKIE_NAME, toPortalSession, verifyPortalSessionToken } from "@/lib/portal/session";

export function getPortalSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value ?? "";
  const payload = verifyPortalSessionToken(token);
  if (!payload) return null;
  return {
    payload,
    session: toPortalSession(payload),
  };
}
