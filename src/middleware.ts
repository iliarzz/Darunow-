import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-session";

const APP_ACCESS_COOKIE_NAME = "app_access";
const APP_ACCESS_PATH = "/coming-soon/access";
const PUBLIC_FILE_REGEX = /\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js|map|txt|xml|json|woff2?|ttf|otf)$/i;
const LAUNCH_CACHE_TTL_MS = 5000;
let launchCache: { value: { isLive: boolean }; expiresAt: number } | null = null;
const SERVER_DOWN_PATH = "/server-down";

const roleRules: { test: (path: string) => boolean; roles: string[] }[] = [
  { test: (p) => p.startsWith("/ops/orders"), roles: ["superAdmin", "ops", "support", "finance"] },
  { test: (p) => p.startsWith("/ops/tickets"), roles: ["superAdmin", "support", "ops"] },
  { test: (p) => p.startsWith("/ops/refunds"), roles: ["superAdmin", "finance"] },
  { test: (p) => p.startsWith("/ops/analytics"), roles: ["superAdmin", "finance", "ops"] },
  { test: (p) => p.startsWith("/ops/audit"), roles: ["superAdmin", "ops"] },
  { test: (p) => p.startsWith("/ops"), roles: ["superAdmin", "ops", "support", "finance"] },
];

const ADMIN_LOGIN_PATH = "/coming-soon/admin/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  if (isServerDownEnabled()) {
    if (pathname === SERVER_DOWN_PATH || pathname.startsWith(`${SERVER_DOWN_PATH}/`)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(SERVER_DOWN_PATH, req.url));
  }

  if (pathname.startsWith("/coming-soon/admin")) {
    if (!hasAdminEnv()) {
      return new NextResponse("Admin credentials not configured.", { status: 500 });
    }
    const ip = getClientIp(req);
    if (!isAllowedIp(ip)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (pathname.startsWith(ADMIN_LOGIN_PATH)) {
      return NextResponse.next();
    }
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? "";
    const { user, pass } = getAdminCredentials();
    const secret = process.env.ADMIN_SESSION_SECRET ?? pass;
    const isValid = await verifyAdminSessionToken({ token, secret, expectedUser: user });
    if (!isValid) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/coming-soon")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/pharmacy-portal")) {
    if (pathname.startsWith("/pharmacy-portal/login")) return NextResponse.next();
    const token = req.cookies.get("portal_session")?.value ?? "";
    if (!token) {
      const loginUrl = new URL("/pharmacy-portal/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/pharmacy")) {
    if (pathname.startsWith("/pharmacy/login")) return NextResponse.next();
    const token =
      req.cookies.get("pharmacy_session")?.value ??
      req.headers.get("authorization")?.replace("Pharmacy ", "") ??
      "";
    if (!token) {
      const loginUrl = new URL("/pharmacy/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/ops")) {
    if (pathname.startsWith("/ops/login")) return NextResponse.next();

    // Demo bypass: allow access with ops key or explicit flag
    const demoBypass = process.env.OPS_DEMO_BYPASS === "true";
    const providedKey =
      req.nextUrl.searchParams.get("key") ??
      req.headers.get("x-ops-key") ??
      req.headers.get("authorization")?.replace("Admin ", "");
    const opsKey = process.env.OPS_ADMIN_KEY;
    if (demoBypass || (opsKey && providedKey === opsKey)) {
      return NextResponse.next();
    }

    const token = req.cookies.get("admin_session")?.value ?? req.headers.get("authorization")?.replace("Admin ", "") ?? "";
    const session = decodeAdminSession(token);
    if (!session) {
      const loginUrl = new URL("/ops/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const rule = roleRules.find((r) => r.test(pathname));
    if (rule && !rule.roles.includes(session.role)) {
      return NextResponse.redirect(new URL("/ops/login", req.url));
    }

    return NextResponse.next();
  }

  const accessCode = process.env.APP_ACCESS_CODE ?? "";
  if (accessCode) {
    const launch = await getLaunchState(req);
    if (!launch.isLive) {
      const accessCookie = req.cookies.get(APP_ACCESS_COOKIE_NAME)?.value ?? "";
      if (accessCookie !== accessCode) {
        const accessUrl = new URL(APP_ACCESS_PATH, req.url);
        accessUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(accessUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

function decodeAdminSession(token: string | null | undefined): { role: string } | null {
  if (!token) return null;
  const [encoded] = token.split(".");
  if (!encoded) return null;
  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = JSON.parse(new TextDecoder().decode(bytes));
    if (json?.actor !== "admin") return null;
    if (json?.exp && Date.now() > Number(json.exp)) return null;
    return { role: json.role as string };
  } catch {
    return null;
  }
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  let ip = forwardedFor || req.ip || "";
  if (!ip) {
    const host = req.headers.get("host") ?? "";
    if (host.includes("localhost") || host.startsWith("127.0.0.1")) {
      ip = "127.0.0.1";
    }
  }
  return ip.replace(/^::ffff:/, "");
}

function getAllowedIps() {
  const envList = process.env.ADMIN_IP_ALLOWLIST ?? "";
  const values = envList
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set(["127.0.0.1", "::1", ...values]);
}

function isAllowedIp(ip: string) {
  const allowed = getAllowedIps();
  if (!ip) return false;
  return allowed.has(ip);
}

function getAdminCredentials() {
  const user = process.env.ADMIN_USER ?? "";
  const pass = process.env.ADMIN_PASS ?? "";
  return { user, pass, ready: Boolean(user && pass) };
}

function hasAdminEnv() {
  return getAdminCredentials().ready;
}

function isServerDownEnabled() {
  return (process.env.SERVER_DOWN_MODE ?? "true").toLowerCase() === "true";
}

async function getLaunchState(req: NextRequest) {
  const now = Date.now();
  if (launchCache && launchCache.expiresAt > now) {
    return launchCache.value;
  }
  try {
    const res = await fetch(new URL("/api/launch", req.nextUrl.origin), { cache: "no-store" });
    if (!res.ok) throw new Error("launch fetch failed");
    const data = (await res.json()) as { isLive?: boolean };
    const value = { isLive: Boolean(data?.isLive) };
    launchCache = { value, expiresAt: now + LAUNCH_CACHE_TTL_MS };
    return value;
  } catch {
    return { isLive: false };
  }
}
