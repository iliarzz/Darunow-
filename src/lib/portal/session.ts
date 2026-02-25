import { createHmac, timingSafeEqual } from "crypto";
import { ROLE_PERMISSIONS } from "@/lib/rbac/permissions";
import type { Permission, Role } from "@/lib/rbac/types";

export const PORTAL_COOKIE_NAME = "portal_session";
export const PORTAL_SESSION_TTL_SECONDS = 60 * 60 * 12;

export type PortalSessionPayload = {
  pharmacyId: string;
  pharmacyName: string;
  role: Role;
  iat: number;
  exp: number;
};

export type PortalSessionResponse = {
  pharmacyId: string;
  pharmacyName: string;
  role: Role;
  permissions: Permission[];
};

type DemoAccount = {
  username: string;
  role: Role;
  pharmacyId: string;
  pharmacyName: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: "owner@darunow.local",
    role: "OWNER",
    pharmacyId: "pharm-darunow",
    pharmacyName: "داروخانه منتخب دارونَو",
  },
  {
    username: "pharmacist@darunow.local",
    role: "PHARMACIST",
    pharmacyId: "pharm-darunow",
    pharmacyName: "داروخانه منتخب دارونَو",
  },
  {
    username: "operator@darunow.local",
    role: "OPERATOR",
    pharmacyId: "pharm-darunow",
    pharmacyName: "داروخانه منتخب دارونَو",
  },
  {
    username: "finance@darunow.local",
    role: "FINANCE",
    pharmacyId: "pharm-darunow",
    pharmacyName: "داروخانه منتخب دارونَو",
  },
  {
    username: "support@darunow.local",
    role: "SUPPORT",
    pharmacyId: "pharm-darunow",
    pharmacyName: "داروخانه منتخب دارونَو",
  },
];

function getPortalSessionSecret() {
  return process.env.PORTAL_SESSION_SECRET || "darunow-portal-session-dev-secret";
}

function getPortalDemoPassword() {
  return process.env.PORTAL_DEMO_PASSWORD || "DarunowPortal123!";
}

export function listPortalDemoAccounts(): Array<Pick<DemoAccount, "username" | "role">> {
  return DEMO_ACCOUNTS.map((account) => ({ username: account.username, role: account.role }));
}

export function authenticatePortalUser(username: string, password: string): PortalSessionPayload | null {
  const account = DEMO_ACCOUNTS.find((item) => item.username.toLowerCase() === username.trim().toLowerCase());
  if (!account) return null;
  if (password !== getPortalDemoPassword()) return null;

  const iat = Date.now();
  return {
    pharmacyId: account.pharmacyId,
    pharmacyName: account.pharmacyName,
    role: account.role,
    iat,
    exp: iat + PORTAL_SESSION_TTL_SECONDS * 1000,
  };
}

export function toPortalSession(payload: PortalSessionPayload): PortalSessionResponse {
  return {
    pharmacyId: payload.pharmacyId,
    pharmacyName: payload.pharmacyName,
    role: payload.role,
    permissions: ROLE_PERMISSIONS[payload.role] ?? [],
  };
}

export function createPortalSessionToken(payload: PortalSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getPortalSessionSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyPortalSessionToken(token: string | null | undefined): PortalSessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expectedSignature = createHmac("sha256", getPortalSessionSecret()).update(body).digest();
  const providedSignature = Buffer.from(signature, "base64url");

  if (providedSignature.length !== expectedSignature.length) return null;
  if (!timingSafeEqual(providedSignature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PortalSessionPayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.role || !ROLE_PERMISSIONS[parsed.role]) return null;
    if (!parsed.pharmacyId || !parsed.pharmacyName) return null;
    if (!parsed.exp || Date.now() > Number(parsed.exp)) return null;
    return parsed;
  } catch {
    return null;
  }
}
