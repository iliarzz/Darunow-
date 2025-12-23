import { useSyncExternalStore } from "react";
import { z } from "zod";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";
import type { AppliedCoupon } from "@/lib/types-v2";

export type CheckoutSession = {
  selectedAddressId?: string;
  selectedPaymentId?: string;
  selectedSlotId?: string;
  slotType?: "express" | "scheduled";
  substitutionPref?: "none" | "similarAllowed" | "askMe";
  appliedCoupon?: AppliedCoupon;
};

const STORAGE_KEY = versionedKey("darunow.checkoutSession", "v1");
const sessionSchema: z.ZodType<CheckoutSession> = z.object({
  selectedAddressId: z.string().optional(),
  selectedPaymentId: z.string().optional(),
  selectedSlotId: z.string().optional(),
  slotType: z.enum(["express", "scheduled"]).optional(),
  substitutionPref: z.enum(["none", "similarAllowed", "askMe"]).optional(),
  appliedCoupon: z
    .object({
      code: z.string(),
      discountType: z.enum(["percent", "fixed"]),
      value: z.number(),
    })
    .optional(),
});

const defaultSession: CheckoutSession = {
  slotType: "express",
  substitutionPref: "askMe",
};

let cachedSession: CheckoutSession = defaultSession;
let lastRaw: string | null = null;
let initialized = false;

function readSession(): CheckoutSession {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedSession;
  lastRaw = raw;
  const parsed = sessionSchema.safeParse(safeJsonParse<CheckoutSession>(raw, defaultSession));
  cachedSession = { ...defaultSession, ...(parsed.success ? parsed.data : defaultSession) };
  initialized = true;
  return cachedSession;
}

function writeSession(next: CheckoutSession): void {
  cachedSession = { ...defaultSession, ...next };
  initialized = true;
  lastRaw = safeJsonStringify(cachedSession);
  setItem(STORAGE_KEY, lastRaw);
}

export function getCheckoutSession(): CheckoutSession {
  return readSession();
}

export function updateCheckoutSession(patch: Partial<CheckoutSession>): CheckoutSession {
  const current = readSession();
  const next = { ...current, ...patch };
  writeSession(next);
  return next;
}

export function clearCheckoutSession(): void {
  writeSession(defaultSession);
}

export function useCheckoutSession(): CheckoutSession {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => getCheckoutSession(),
    () => defaultSession,
  );
}
