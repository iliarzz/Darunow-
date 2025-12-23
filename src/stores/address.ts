import { useSyncExternalStore } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";
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

export async function syncAddressesFromServer(): Promise<Address[]> {
  try {
    const remote = await api.listAddresses();
    const next = ensureDefault(sortAddresses(remote));
    writeAddresses(next);
    return next;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("addresses sync failed", err);
    }
    return readAddresses();
  }
}

export async function createAddress(input: Omit<Address, "id" | "createdAt" | "updatedAt">): Promise<Address> {
  const existing = readAddresses();
  const isDefault = input.isDefault || existing.length === 0;
  const created = await api.createAddress({ ...input, isDefault });
  const next = ensureDefault([
    created,
    ...existing.map((a) => ({ ...a, isDefault: isDefault ? false : a.isDefault })),
  ]);
  writeAddresses(next);
  return created;
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, "id" | "createdAt">>,
): Promise<Address | undefined> {
  const existing = readAddresses();
  const target = existing.find((a) => a.id === id);
  if (!target) return undefined;
  const wantsDefault = data.isDefault === true;
  if (wantsDefault) {
    await api.updateAddress(id, { ...data, isDefault: true });
    const updated = await api.listAddresses();
    writeAddresses(ensureDefault(sortAddresses(updated)));
    return updated.find((a) => a.id === id);
  }
  const updated = await api.updateAddress(id, data);
  const next = existing.map((addr) => (addr.id === id ? updated : addr));
  writeAddresses(ensureDefault(next));
  return updated;
}

export async function removeAddress(id: string): Promise<void> {
  await api.deleteAddress(id);
  const remaining = readAddresses().filter((a) => a.id !== id);
  writeAddresses(ensureDefault(remaining));
}

export async function setDefaultAddress(id: string): Promise<Address | undefined> {
  const existing = readAddresses();
  const target = existing.find((a) => a.id === id);
  if (!target) return undefined;
  await api.updateAddress(id, { isDefault: true });
  const refreshed = await api.listAddresses();
  const sorted = ensureDefault(sortAddresses(refreshed));
  writeAddresses(sorted);
  return sorted.find((a) => a.id === id);
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
