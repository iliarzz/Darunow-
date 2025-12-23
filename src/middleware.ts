import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const roleRules: { test: (path: string) => boolean; roles: string[] }[] = [
  { test: (p) => p.startsWith("/ops/orders"), roles: ["superAdmin", "ops", "support", "finance"] },
  { test: (p) => p.startsWith("/ops/tickets"), roles: ["superAdmin", "support", "ops"] },
  { test: (p) => p.startsWith("/ops/refunds"), roles: ["superAdmin", "finance"] },
  { test: (p) => p.startsWith("/ops/analytics"), roles: ["superAdmin", "finance", "ops"] },
  { test: (p) => p.startsWith("/ops/audit"), roles: ["superAdmin", "ops"] },
  { test: (p) => p.startsWith("/ops"), roles: ["superAdmin", "ops", "support", "finance"] },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/ops")) return NextResponse.next();
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

export const config = {
  matcher: ["/ops/:path*"],
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
