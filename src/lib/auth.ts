import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

type SessionPayload = {
  userId: string;
  phone: string;
  exp: number;
};

type PharmacySession = {
  actor: "pharmacy";
  pharmacyId: string;
  userId: string;
  role: string;
  exp: number;
};

type AdminSession = {
  actor: "admin";
  userId: string;
  role: string;
  exp: number;
};

type ProviderSession = {
  actor: "provider";
  orgId: string;
  providerUserId: string;
  role: string;
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

export function signPharmacySession(payload: Omit<PharmacySession, "exp" | "actor">): string {
  const exp = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;
  const body: PharmacySession = { ...payload, actor: "pharmacy", exp };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyPharmacySession(token?: string | null): PharmacySession | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as PharmacySession;
    if (payload.actor !== "pharmacy") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractPharmacyToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Pharmacy ")) {
    return header.slice("Pharmacy ".length);
  }
  const cookieToken = req.cookies.get("pharmacy_session")?.value;
  return cookieToken ?? null;
}

export async function getPharmacySession(req: NextRequest) {
  const token = extractPharmacyToken(req);
  const payload = verifyPharmacySession(token);
  if (!payload) return null;
  const user = await prisma.pharmacyUser.findUnique({ where: { id: payload.userId } });
  if (!user || user.pharmacyId !== payload.pharmacyId) return null;
  return { session: payload, user };
}

export async function getPharmacySessionFromCookie(token?: string | null) {
  const payload = verifyPharmacySession(token ?? undefined);
  if (!payload) return null;
  const user = await prisma.pharmacyUser.findUnique({ where: { id: payload.userId } });
  if (!user || user.pharmacyId !== payload.pharmacyId) return null;
  return { session: payload, user };
}

export function signAdminSession(payload: Omit<AdminSession, "exp" | "actor">): string {
  const exp = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;
  const body: AdminSession = { ...payload, actor: "admin", exp };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyAdminSession(token?: string | null): AdminSession | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSession;
    if (payload.actor !== "admin") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractAdminToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Admin ")) {
    return header.slice("Admin ".length);
  }
  const cookieToken = req.cookies.get("admin_session")?.value;
  return cookieToken ?? null;
}

export async function getAdminSession(req: NextRequest) {
  const token = extractAdminToken(req);
  const payload = verifyAdminSession(token);
  if (!payload) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== payload.role) return null;
  return { session: payload, user };
}

export async function getAdminSessionFromCookie(token?: string | null) {
  const payload = verifyAdminSession(token ?? undefined);
  if (!payload) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== payload.role) return null;
  return { session: payload, user };
}

export function signProviderSession(payload: Omit<ProviderSession, "exp" | "actor">): string {
  const exp = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;
  const body: ProviderSession = { ...payload, actor: "provider", exp };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyProviderSession(token?: string | null): ProviderSession | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ProviderSession;
    if (payload.actor !== "provider") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractProviderToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Provider ")) {
    return header.slice("Provider ".length);
  }
  const cookieToken = req.cookies.get("provider_session")?.value;
  return cookieToken ?? null;
}

export async function getProviderSession(req: NextRequest) {
  const token = extractProviderToken(req);
  const payload = verifyProviderSession(token);
  if (!payload) return null;
  const providerUser = await prisma.providerUser.findUnique({
    where: { id: payload.providerUserId },
    include: { org: true },
  });
  if (!providerUser || providerUser.orgId !== payload.orgId || providerUser.role !== payload.role) return null;
  return { session: payload, user: providerUser };
}

export async function getProviderSessionFromCookie(token?: string | null) {
  const payload = verifyProviderSession(token ?? undefined);
  if (!payload) return null;
  const providerUser = await prisma.providerUser.findUnique({
    where: { id: payload.providerUserId },
    include: { org: true },
  });
  if (!providerUser || providerUser.orgId !== payload.orgId || providerUser.role !== payload.role) return null;
  return { session: payload, user: providerUser };
}

export async function requireProvider(req: NextRequest) {
  const session = await getProviderSession(req);
  if (!session) throw new Error("unauthorized");
  return session;
}
