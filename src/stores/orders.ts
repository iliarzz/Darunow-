import { useSyncExternalStore } from "react";
import { z } from "zod";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";
import { api } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.orders", "v1");
let cachedOrders: Order[] = [];
let lastRaw: string | null = null;
let initialized = false;

const statusEnum = z.enum([
  "created",
  "rx_received",
  "rx_review",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunding",
  "refunded",
]);

const orderItemSchema = z.object({
  name: z.string(),
  qty: z.number(),
  price: z.number(),
  productId: z.string().optional(),
  pharmacyId: z.string().optional(),
  subtitle: z.string().optional(),
});

const orderSchema: z.ZodType<Order> = z.object({
  id: z.string(),
  createdAt: z.number(),
  pharmacyId: z.string().optional(),
  status: statusEnum,
  items: z.array(orderItemSchema),
  total: z.number(),
  discount: z.number(),
  payable: z.number(),
  addressId: z.string(),
  deliverySlotId: z.string().optional(),
  paymentType: z.enum(["online", "cod", "card"]),
  substitution: z.enum(["none", "similarAllowed", "askMe"]),
  notes: z.string().optional(),
  timeline: z.array(z.object({ status: statusEnum, at: z.number() })),
});

const orderListSchema = z.array(orderSchema);

function readOrders(): Order[] {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedOrders;
  lastRaw = raw;
  const parsed = orderListSchema.safeParse(safeJsonParse<Order[]>(raw, []));
  cachedOrders = sortOrders(parsed.success ? parsed.data : []);
  initialized = true;
  return cachedOrders;
}

function writeOrders(orders: Order[]): void {
  cachedOrders = sortOrders(orders);
  initialized = true;
  lastRaw = safeJsonStringify(cachedOrders);
  setItem(STORAGE_KEY, lastRaw);
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.createdAt - a.createdAt);
}

function appendTimeline(order: Order, status: OrderStatus): Order {
  const now = Date.now();
  if (order.timeline.some((t) => t.status === status)) {
    return { ...order, status, timeline: order.timeline.map((t) => (t.status === status ? { ...t, at: now } : t)) };
  }
  return {
    ...order,
    status,
    timeline: [...order.timeline, { status, at: now }].sort((a, b) => a.at - b.at),
  };
}

export function listOrders(): Order[] {
  return readOrders();
}

export function getOrder(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

export async function syncOrdersFromServer(): Promise<Order[]> {
  try {
    const remote = await api.listOrders();
    writeOrders(remote);
    return remote;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("orders sync failed", err);
    }
    return readOrders();
  }
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "timeline"> & Partial<Pick<Order, "id" | "createdAt">>,
): Promise<Order> {
  const payload = { ...input };
  const order = await api.createOrder(payload);
  const existing = readOrders();
  writeOrders([order, ...existing]);
  return order;
}

export function updateOrder(id: string, data: Partial<Omit<Order, "id">>): Order | undefined {
  const existing = readOrders();
  let updated: Order | undefined;
  const next = existing.map((order) => {
    if (order.id !== id) return order;
    const merged = { ...order, ...data };
    updated = merged.status !== order.status ? appendTimeline(merged, merged.status) : merged;
    return updated;
  });
  if (!updated) return undefined;
  writeOrders(next);
  return updated;
}

export function advanceOrderStatus(orderId: string, newStatus: OrderStatus): Order | undefined {
  const existing = readOrders();
  let target: Order | undefined;
  const next = existing.map((order) => {
    if (order.id !== orderId) return order;
    target = appendTimeline(order, newStatus);
    return target;
  });
  if (!target) return undefined;
  writeOrders(next);
  return target;
}

export function useOrders(): Order[] {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listOrders(),
    () => [],
  );
}

export function useOrder(id?: string): Order | undefined {
  const orders = useOrders();
  if (!id) return undefined;
  return orders.find((o) => o.id === id);
}
