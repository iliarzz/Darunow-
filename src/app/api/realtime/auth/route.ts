import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import Ably from "ably/promises";
import { prisma } from "@/lib/prisma";
import { getAdminSession, getSessionUser } from "@/lib/auth";
import { withApiContext } from "@/observability/api";
import { AppError } from "@/observability/errors";
import { logEvent } from "@/observability/logger";
import { setActorContext, setOrderContext } from "@/observability/requestContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Actor = { type: "admin" | "user" | "ops" | "courier"; id: string };

function hashId(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

function parseOrderChannel(channel: string): string | null {
  if (!channel.startsWith("order:")) return null;
  const [, orderId] = channel.split(":");
  return orderId || null;
}

async function assertChannelAccess(req: NextRequest, channel: string): Promise<Actor> {
  const admin = await getAdminSession(req);
  if (admin) {
    setActorContext("admin", admin.session.userId);
    return { type: "admin", id: admin.session.userId };
  }

  const opsKey = process.env.OPS_ADMIN_KEY;
  const providedOpsKey = req.headers.get("x-ops-key") ?? req.nextUrl.searchParams.get("opsKey");
  if (opsKey && providedOpsKey === opsKey) {
    setActorContext("admin", "ops-key");
    return { type: "ops", id: "ops-key" };
  }

  const user = await getSessionUser(req);
  if (!user) {
    throw new AppError("unauthorized", { status: 401, publicMessage: "احراز هویت نیاز است." });
  }
  setActorContext("user", user.id);

  if (channel === channelBuilders.user(user.id)) {
    return { type: "user", id: user.id };
  }

  const orderId = parseOrderChannel(channel);
  if (orderId) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id }, select: { id: true } });
    if (!order) {
      throw new AppError("forbidden", { status: 403, publicMessage: "اجازه دسترسی ندارید." });
    }
    setOrderContext(order.id);
    return { type: "user", id: user.id };
  }

  throw new AppError("forbidden", { status: 403, publicMessage: "اجازه دسترسی ندارید." });
}

function buildCapability(channel: string): Ably.Types.TokenParams["capability"] {
  return { [channel]: ["subscribe"] };
}

const channelBuilders = {
  user: (userId: string) => `user:${userId}:notifications`,
  order: (orderId: string) => `order:${orderId}:events`,
  courier: (courierId: string) => `courier:${courierId}:jobs`,
  opsDispatch: "ops:dispatch",
};

export const POST = withApiContext(async (req: NextRequest) => {
  if (!process.env.ABLY_API_KEY) {
    throw new AppError("realtime provider not configured", { status: 503, publicMessage: "سرویس همگام‌سازی فعال نیست." });
  }
  const { channel } = (await req.json().catch(() => ({}))) as { channel?: string };
  if (!channel || typeof channel !== "string") {
    throw new AppError("channel required", { status: 400, publicMessage: "کانال معتبر نیست." });
  }

  const actor = await assertChannelAccess(req, channel);

  const ably = new Ably.Rest(process.env.ABLY_API_KEY);
  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: `${actor.type}-${hashId(actor.id)}`,
    capability: buildCapability(channel),
    ttl: 1000 * 60 * 30,
  });

  logEvent("realtime.auth_issued", { channel, actor: actor.type });

  return NextResponse.json(tokenRequest);
});
