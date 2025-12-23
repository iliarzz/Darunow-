import Ably from "ably/promises";

export type RealtimeEventName =
  | "delivery_status_changed"
  | "courier_location_updated"
  | "eta_updated"
  | "pod_captured";

type Message = {
  channel: string;
  event: RealtimeEventName | string;
  payload: unknown;
};

export type RealtimeHandler = (message: Message) => void;

export interface RealtimeClient {
  publish: (channel: string, event: Message["event"], payload: Message["payload"]) => Promise<void> | void;
  subscribe: (channel: string, handler: RealtimeHandler) => () => void;
}

const channelBuilders = {
  user: (userId: string) => `user:${userId}:notifications`,
  order: (orderId: string) => `order:${orderId}:events`,
  courier: (courierId: string) => `courier:${courierId}:jobs`,
  opsDispatch: "ops:dispatch",
};

const RETENTION_MS = 1000 * 60 * 60 * 24;
const MAX_EVENTS_PER_CHANNEL = 500;

async function persistRealtimeEvent(channel: string, eventType: string, payload: unknown) {
  if (typeof window !== "undefined") return;
  try {
    const { prisma } = await import("../prisma");
    const now = Date.now();
    await prisma.realtimeEvent.create({
      data: {
        channel,
        eventType,
        payloadJson: payload as any,
      },
    });
    const cutoff = new Date(now - RETENTION_MS);
    await prisma.realtimeEvent.deleteMany({
      where: { channel, createdAt: { lt: cutoff } },
    });
    const extras = await prisma.realtimeEvent.findMany({
      where: { channel },
      orderBy: { createdAt: "desc" },
      skip: MAX_EVENTS_PER_CHANNEL,
      select: { id: true },
    });
    if (extras.length > 0) {
      await prisma.realtimeEvent.deleteMany({ where: { id: { in: extras.map((e) => e.id) } } });
    }
  } catch (err) {
    if (typeof window === "undefined") {
      const { logEvent } = await import("@/observability/logger");
      logEvent("realtime.persist_failed", { channel, error: (err as Error)?.message }, "warn");
    }
  }
}

export async function replayEvents(channel: string, limit = 50) {
  if (typeof window !== "undefined") return [];
  const { prisma } = await import("../prisma");
  const rows = await prisma.realtimeEvent.findMany({
    where: { channel },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows
    .reverse()
    .map((row) => ({ channel: row.channel, event: row.eventType, payload: row.payloadJson, at: row.createdAt.getTime() }));
}

class DevLocalRealtime implements RealtimeClient {
  private channels = new Map<string, Set<RealtimeHandler>>();

  publish(channel: string, event: Message["event"], payload: Message["payload"]): void {
    const handlers = this.channels.get(channel);
    if (!handlers) return;
    const message: Message = { channel, event, payload };
    handlers.forEach((handler) => {
      try {
        handler(message);
      } catch {
        // swallow handler errors in dev bus
      }
    });
  }

  subscribe(channel: string, handler: RealtimeHandler): () => void {
    const handlers = this.channels.get(channel) ?? new Set<RealtimeHandler>();
    handlers.add(handler);
    this.channels.set(channel, handlers);
    return () => {
      const existing = this.channels.get(channel);
      if (!existing) return;
      existing.delete(handler);
      if (existing.size === 0) {
        this.channels.delete(channel);
      }
    };
  }
}

class PersistingRealtimeClient implements RealtimeClient {
  constructor(private base: RealtimeClient) {}

  async publish(channel: string, event: Message["event"], payload: Message["payload"]) {
    await persistRealtimeEvent(channel, String(event), payload);
    return this.base.publish(channel, event, payload);
  }

  subscribe(channel: string, handler: RealtimeHandler) {
    return this.base.subscribe(channel, handler);
  }
}

class AblyRealtime implements RealtimeClient {
  private rest?: Ably.Rest;
  private realtime?: Ably.Realtime;
  private authorized = new Set<string>();

  private getRest(): Ably.Rest {
    if (!this.rest) {
      const apiKey = process.env.ABLY_API_KEY;
      if (!apiKey) {
        throw new Error("ABLY_API_KEY missing");
      }
      this.rest = new Ably.Rest({ key: apiKey });
    }
    return this.rest;
  }

  private getRealtime(): Ably.Realtime {
    if (!this.realtime) {
      this.realtime = new Ably.Realtime({
        authUrl: "/api/realtime/auth",
        authMethod: "POST",
      });
    }
    return this.realtime;
  }

  async publish(channel: string, event: Message["event"], payload: Message["payload"]) {
    const rest = this.getRest();
    await rest.channels.get(channel).publish(String(event), payload);
  }

  subscribe(channel: string, handler: RealtimeHandler): () => void {
    if (typeof window === "undefined") return () => {};
    const client = this.getRealtime();
    const ablyHandler = (msg: Ably.Types.Message) => handler({ channel, event: msg.name ?? "message", payload: msg.data });

    const subscribeWithAuth = async () => {
      if (!this.authorized.has(channel)) {
        await client.auth.authorize(
          { capability: { [channel]: ["subscribe"] } },
          {
            authUrl: "/api/realtime/auth",
            authMethod: "POST",
            authHeaders: { "Content-Type": "application/json" },
            authParams: { channel },
          },
        );
        this.authorized.add(channel);
      }
      const ch = client.channels.get(channel);
      await ch.attach();
      ch.subscribe(ablyHandler);
    };

    void subscribeWithAuth();

    return () => {
      const ch = this.realtime?.channels.get(channel);
      ch?.unsubscribe(ablyHandler);
    };
  }
}

function createRealtimeClient(): RealtimeClient {
  const provider = (process.env.REALTIME_PROVIDER ?? "dev").toLowerCase();
  let base: RealtimeClient;
  if (provider === "ably") {
    base = new AblyRealtime();
  } else {
    base = new DevLocalRealtime();
  }
  if (typeof window === "undefined") {
    return new PersistingRealtimeClient(base);
  }
  return base;
}

let singleton: RealtimeClient | null = null;

export function realtime(): RealtimeClient {
  if (!singleton) singleton = createRealtimeClient();
  return singleton;
}

export const realtimeChannels = channelBuilders;

export const realtimeEvents = {
  deliveryStatusChanged: "delivery_status_changed" as const,
  courierLocationUpdated: "courier_location_updated" as const,
  etaUpdated: "eta_updated" as const,
  podCaptured: "pod_captured" as const,
};
