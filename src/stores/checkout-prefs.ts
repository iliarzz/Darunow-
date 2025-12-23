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
import type { CheckoutPrefs } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.checkoutPrefs", "v1");
let cachedPrefs: CheckoutPrefs | null = null;
let lastRaw: string | null = null;
let initialized = false;

const prefsSchema: z.ZodType<CheckoutPrefs> = z.object({
  substitution: z.enum(["none", "similarAllowed", "askMe"]),
  preferredDeliveryType: z.enum(["express", "scheduled"]),
});

const defaultPrefs: CheckoutPrefs = {
  substitution: "askMe",
  preferredDeliveryType: "express",
};

function readPrefs(): CheckoutPrefs {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized && cachedPrefs) return cachedPrefs;
  lastRaw = raw;
  const parsed = prefsSchema.safeParse(safeJsonParse<CheckoutPrefs>(raw, defaultPrefs));
  cachedPrefs = parsed.success ? parsed.data : defaultPrefs;
  initialized = true;
  return cachedPrefs;
}

function writePrefs(prefs: CheckoutPrefs): void {
  cachedPrefs = prefs;
  initialized = true;
  lastRaw = safeJsonStringify(prefs);
  setItem(STORAGE_KEY, lastRaw);
}

export function getCheckoutPrefs(): CheckoutPrefs {
  return readPrefs();
}

export function setCheckoutPrefs(prefs: CheckoutPrefs): CheckoutPrefs {
  const next: CheckoutPrefs = { ...defaultPrefs, ...prefs };
  writePrefs(next);
  return next;
}

export function setSubstitutionPreference(pref: CheckoutPrefs["substitution"]): CheckoutPrefs {
  const current = readPrefs();
  const next = { ...current, substitution: pref };
  writePrefs(next);
  return next;
}

export function setPreferredDeliveryType(pref: CheckoutPrefs["preferredDeliveryType"]): CheckoutPrefs {
  const current = readPrefs();
  const next = { ...current, preferredDeliveryType: pref };
  writePrefs(next);
  return next;
}

export function useCheckoutPrefs(): CheckoutPrefs {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => getCheckoutPrefs(),
    () => defaultPrefs,
  );
}
