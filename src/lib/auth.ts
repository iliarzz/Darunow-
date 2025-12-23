import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

type SessionPayload = {
  userId: string;
  phone: string;
  exp: number;
};

const SESSION_TTL_HOURS = 24 * 7;

function getSecret(): string {
  return process.env.JWT_SECRET || "dev-secret";
}

export function signSession(payload: Omit<SessionPayload, "exp">): string {
  const exp = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;
  const body: SessionPayload = { ...payload, exp };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySession(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || !payload.phone) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  const cookieToken = req.cookies.get("session")?.value;
  return cookieToken ?? null;
}

export async function getSessionUser(req: NextRequest) {
  const token = extractToken(req);
  const payload = verifySession(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user;
}

export async function requireUser(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) throw new Error("unauthorized");
  return user;
}
