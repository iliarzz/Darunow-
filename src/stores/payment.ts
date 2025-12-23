import { useSyncExternalStore } from "react";
import { z } from "zod";
import {
  generateId,
  getItem,
  safeJsonParse,
  safeJsonStringify,
  setItem,
  subscribe,
  versionedKey,
} from "@/lib/storage";
import type { PaymentMethod } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.payments", "v1");
let cachedPayments: PaymentMethod[] = [];
let lastRaw: string | null = null;
let initialized = false;

const paymentSchema: z.ZodType<PaymentMethod> = z.object({
  id: z.string(),
  type: z.enum(["online", "cod", "card"]),
  label: z.string(),
  last4: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.number(),
});

const paymentListSchema = z.array(paymentSchema);

function readPayments(): PaymentMethod[] {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedPayments;
  lastRaw = raw;
  const parsed = paymentListSchema.safeParse(safeJsonParse<PaymentMethod[]>(raw, []));
  let list = parsed.success ? parsed.data : [];
  if (list.length === 0 && typeof window !== "undefined") {
    list = [seedDefaultPayment()];
  }
  cachedPayments = ensureDefault(sortPayments(list));
  initialized = true;
  return cachedPayments;
}

function writePayments(list: PaymentMethod[]): void {
  cachedPayments = ensureDefault(sortPayments(list));
  initialized = true;
  lastRaw = safeJsonStringify(cachedPayments);
  setItem(STORAGE_KEY, lastRaw);
}

function sortPayments(list: PaymentMethod[]): PaymentMethod[] {
  return [...list].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return b.createdAt - a.createdAt;
  });
}

function ensureDefault(list: PaymentMethod[]): PaymentMethod[] {
  if (list.length === 0) return list;
  if (!list.some((p) => p.isDefault)) {
    const [first, ...rest] = list;
    return [{ ...first, isDefault: true }, ...rest];
  }
  return list;
}

function seedDefaultPayment(): PaymentMethod {
  const now = Date.now();
  return {
    id: generateId("pay"),
    type: "online",
    label: "پرداخت آنلاین",
    isDefault: true,
    createdAt: now,
  };
}

export function listPayments(): PaymentMethod[] {
  return readPayments();
}

export function createPayment(input: Omit<PaymentMethod, "id" | "createdAt">): PaymentMethod {
  const now = Date.now();
  const existing = readPayments();
  const isDefault = input.isDefault || existing.length === 0;
  const record: PaymentMethod = {
    ...input,
    id: generateId("pay"),
    isDefault,
    createdAt: now,
  };
  const next = ensureDefault([
    record,
    ...existing.map((p) => ({ ...p, isDefault: isDefault ? false : p.isDefault })),
  ]);
  writePayments(next);
  return record;
}

export function removePayment(id: string): void {
  const remaining = readPayments().filter((p) => p.id !== id);
  writePayments(ensureDefault(remaining));
}

export function setDefaultPayment(id: string): PaymentMethod | undefined {
  const existing = readPayments();
  let found: PaymentMethod | undefined;
  const next = existing.map((p) => {
    if (p.id === id) {
      found = { ...p, isDefault: true };
      return found;
    }
    return { ...p, isDefault: false };
  });
  if (!found) return undefined;
  writePayments(next);
  return found;
}

export function usePayments(): PaymentMethod[] {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listPayments(),
    () => [],
  );
}
