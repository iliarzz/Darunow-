import { AsyncLocalStorage } from "async_hooks";
import { createHash, randomUUID } from "crypto";
import type { NextRequest } from "next/server";

type ActorType = "user" | "pharmacy" | "admin" | "provider" | "anonymous";

export type RequestContext = {
  requestId: string;
  actorType?: ActorType;
  /**
   * Hashed identifier to avoid leaking raw ids/PII into logs or tracing headers.
   */
  actorId?: string;
  orderId?: string;
};

const store = new AsyncLocalStorage<RequestContext>();

const baseFetch = typeof fetch === "function" ? fetch.bind(globalThis) : undefined;
let fetchPatched = false;

type ContextSeed = Partial<RequestContext> & { actorIdIsHashed?: boolean };

function hashId(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

function readContextFromHeaders(headers: Headers): ContextSeed {
  const requestId = headers.get("x-request-id") ?? undefined;
  const actorType = headers.get("x-actor-type") as ActorType | null;
  const actorId = headers.get("x-actor-id") ?? undefined;
  const orderId = headers.get("x-order-id") ?? undefined;
  return {
    requestId,
    actorType: actorType ?? undefined,
    actorId: actorId ?? undefined,
    actorIdIsHashed: Boolean(actorId),
    orderId: orderId ?? undefined,
  };
}

function ensureFetchPatched() {
  if (fetchPatched || typeof window !== "undefined" || !baseFetch) return;
  const patched: typeof fetch = async (input, init = {}) => {
    const ctx = store.getStore();
    if (!ctx) return baseFetch(input, init);
    const headers = new Headers(init.headers ?? {});
    headers.set("x-request-id", ctx.requestId);
    if (ctx.actorType) headers.set("x-actor-type", ctx.actorType);
    if (ctx.actorId) headers.set("x-actor-id", ctx.actorId);
    if (ctx.orderId) headers.set("x-order-id", ctx.orderId);
    return baseFetch(input, { ...init, headers });
  };
  globalThis.fetch = patched;
  fetchPatched = true;
}

function buildContext(seed: ContextSeed): RequestContext {
  const actorId = seed.actorIdIsHashed ? seed.actorId : hashId(seed.actorId);
  return {
    requestId: seed.requestId ?? randomUUID(),
    actorType: seed.actorType,
    actorId,
    orderId: seed.orderId,
  };
}

export function getRequestContext(): RequestContext | undefined {
  return store.getStore();
}

export function withRequestContext<T>(
  seed: ContextSeed | (() => ContextSeed),
  fn: () => T | Promise<T>,
): Promise<T> | T {
  const resolvedSeed = typeof seed === "function" ? seed() : seed;
  const ctx = buildContext(resolvedSeed);
  ensureFetchPatched();
  return store.run(ctx, fn);
}

export function withRequestContextFromRequest<T>(
  req: NextRequest | Request,
  fn: () => T | Promise<T>,
  overrides?: ContextSeed,
): Promise<T> | T {
  return withRequestContext(
    { ...readContextFromHeaders(req.headers), ...overrides },
    fn,
  );
}

export function setActorContext(actorType: ActorType, actorId?: string) {
  const ctx = store.getStore();
  if (!ctx) return;
  ctx.actorType = actorType;
  ctx.actorId = hashId(actorId);
}

export function setOrderContext(orderId?: string | null) {
  const ctx = store.getStore();
  if (!ctx) return;
  ctx.orderId = orderId ?? undefined;
}

export function getRequestId(): string | undefined {
  return store.getStore()?.requestId;
}
