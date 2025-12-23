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
import type { Address } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.addresses", "v1");
let cachedAddresses: Address[] = [];
let lastRaw: string | null = null;
let initialized = false;

const addressSchema: z.ZodType<Address> = z.object({
  id: z.string(),
  label: z.enum(["خانه", "کار", "سایر"]),
  recipientName: z.string(),
  phone: z.string(),
  province: z.string(),
  city: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const addressListSchema = z.array(addressSchema);

function sortAddresses(addresses: Address[]): Address[] {
  return [...addresses].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

function ensureDefault(addresses: Address[]): Address[] {
  if (addresses.length === 0) return addresses;
  if (!addresses.some((a) => a.isDefault)) {
    const [first, ...rest] = addresses;
    return [{ ...first, isDefault: true, updatedAt: Date.now() }, ...rest];
  }
  return addresses;
}

function readAddresses(): Address[] {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedAddresses;
  lastRaw = raw;
  const parsed = addressListSchema.safeParse(safeJsonParse<Address[]>(raw, []));
  cachedAddresses = ensureDefault(sortAddresses(parsed.success ? parsed.data : []));
  initialized = true;
  return cachedAddresses;
}

function writeAddresses(addresses: Address[]): void {
  cachedAddresses = ensureDefault(sortAddresses(addresses));
  initialized = true;
  lastRaw = safeJsonStringify(cachedAddresses);
  setItem(STORAGE_KEY, lastRaw);
}

export function listAddresses(): Address[] {
  return readAddresses();
}

export function getAddress(id: string): Address | undefined {
  return readAddresses().find((a) => a.id === id);
}

export function createAddress(input: Omit<Address, "id" | "createdAt" | "updatedAt">): Address {
  const now = Date.now();
  const existing = readAddresses();
  const isDefault = input.isDefault || existing.length === 0;
  const record: Address = {
    ...input,
    id: generateId("addr"),
    isDefault,
    createdAt: now,
    updatedAt: now,
  };
  const next = ensureDefault([
    record,
    ...existing.map((a) => ({ ...a, isDefault: isDefault ? false : a.isDefault })),
  ]);
  writeAddresses(next);
  return record;
}

export function updateAddress(
  id: string,
  data: Partial<Omit<Address, "id" | "createdAt">>,
): Address | undefined {
  const existing = readAddresses();
  let updated: Address | undefined;
  const wantsDefault = data.isDefault ?? false;
  const next = existing.map((addr) => {
    if (addr.id !== id) {
      return wantsDefault ? { ...addr, isDefault: false } : addr;
    }
    updated = {
      ...addr,
      ...data,
      isDefault: wantsDefault ? true : data.isDefault ?? addr.isDefault,
      updatedAt: Date.now(),
    };
    return updated;
  });

  if (!updated) return undefined;
  writeAddresses(ensureDefault(next));
  return updated;
}

export function removeAddress(id: string): void {
  const remaining = readAddresses().filter((a) => a.id !== id);
  writeAddresses(ensureDefault(remaining));
}

export function setDefaultAddress(id: string): Address | undefined {
  const existing = readAddresses();
  let found: Address | undefined;
  const next = existing.map((addr) => {
    if (addr.id === id) {
      found = { ...addr, isDefault: true, updatedAt: Date.now() };
      return found;
    }
    return { ...addr, isDefault: false };
  });
  if (!found) return undefined;
  writeAddresses(next);
  return found;
}

export function useAddresses(): Address[] {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listAddresses(),
    () => [],
  );
}

export function useAddress(id?: string): Address | undefined {
  const addresses = useAddresses();
  if (!id) return addresses.find((a) => a.isDefault) ?? addresses[0];
  return addresses.find((a) => a.id === id);
}
