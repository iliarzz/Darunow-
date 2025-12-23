import { useSyncExternalStore } from "react";
import { z } from "zod";
import {
  getItem,
  safeJsonParse,
  safeJsonStringify,
  setItem,
  subscribe,
  versionedKey,
} from "@/lib/storage";
import type { AppliedCoupon } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.coupons", "v1");
let cachedState: CouponState = {};
let lastRaw: string | null = null;
let initialized = false;

const couponSchema: z.ZodType<AppliedCoupon> = z.object({
  code: z.string(),
  discountType: z.enum(["percent", "fixed"]),
  value: z.number(),
});

const stateSchema = z.object({
  appliedCoupon: couponSchema.optional(),
});

type CouponState = z.infer<typeof stateSchema>;

const defaultState: CouponState = {};

function readState(): CouponState {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedState;
  lastRaw = raw;
  const parsed = stateSchema.safeParse(safeJsonParse<CouponState>(raw, defaultState));
  cachedState = parsed.success ? parsed.data : defaultState;
  initialized = true;
  return cachedState;
}

function writeState(state: CouponState): void {
  cachedState = state;
  initialized = true;
  lastRaw = safeJsonStringify(state);
  setItem(STORAGE_KEY, lastRaw);
}

export function getAppliedCoupon(): AppliedCoupon | undefined {
  return readState().appliedCoupon;
}

export function applyCoupon(coupon: AppliedCoupon): AppliedCoupon {
  writeState({ appliedCoupon: coupon });
  return coupon;
}

export function clearCoupon(): void {
  writeState({});
}

export function useAppliedCoupon(): AppliedCoupon | undefined {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => getAppliedCoupon(),
    () => undefined,
  );
}
