import { useSyncExternalStore } from "react";
import { z } from "zod";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";
import { seedPharmacies, seedProducts } from "@/lib/mock/seed";
import type { Pharmacy, Product } from "@/lib/types";

export type CartItem = {
  id: string;
  pharmacyId: string;
  name: string;
  price: number;
  qty: number;
  subtitle?: string;
};

export type CartItemInput = Omit<CartItem, "qty"> & { qty?: number };
export type CartLine = { item: CartItem; product?: Product; pharmacy?: Pharmacy };

const STORAGE_KEY = versionedKey("darunow.cart", "v1");
let cachedCart: CartItem[] = [];
let lastRaw: string | null = null;
let initialized = false;

const cartItemSchema: z.ZodType<CartItem> = z.object({
  id: z.string(),
  pharmacyId: z.string(),
  name: z.string(),
  price: z.number(),
  qty: z.number(),
  subtitle: z.string().optional(),
});

const cartListSchema = z.array(cartItemSchema);

const pharmacyIndex = new Map(seedPharmacies.map((p) => [p.id, p]));
const productIndex = new Map(seedProducts.map((p) => [p.id, p]));

function readCart(): CartItem[] {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedCart;
  lastRaw = raw;
  const parsed = cartListSchema.safeParse(safeJsonParse<CartItem[]>(raw, []));
  cachedCart = normalizeCart(parsed.success ? parsed.data : []);
  initialized = true;
  return cachedCart;
}

function writeCart(items: CartItem[]): void {
  cachedCart = normalizeCart(items);
  initialized = true;
  lastRaw = safeJsonStringify(cachedCart);
  setItem(STORAGE_KEY, lastRaw);
}

function normalizeCart(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    ...item,
    qty: Math.max(1, Math.round(item.qty || 1)),
  }));
}

export function listCartItems(): CartItem[] {
  return readCart();
}

export function addToCart(input: CartItemInput): CartItem {
  const qty = Math.max(1, Math.round(input.qty ?? 1));
  const existing = readCart();
  const found = existing.find((c) => c.id === input.id);
  const next = found
    ? existing.map((c) => (c.id === input.id ? { ...c, qty: c.qty + qty } : c))
    : [{ ...input, qty }, ...existing];
  writeCart(next);
  return next.find((c) => c.id === input.id)!;
}

export function setItemQty(id: string, qty: number): CartItem[] {
  const normalized = Math.max(0, Math.round(qty));
  const next = normalized === 0
    ? readCart().filter((c) => c.id !== id)
    : readCart().map((c) => (c.id === id ? { ...c, qty: normalized } : c));
  writeCart(next);
  return next;
}

export function removeFromCart(id: string): void {
  writeCart(readCart().filter((c) => c.id !== id));
}

export function clearCart(): void {
  writeCart([]);
}

export function cartHasDifferentPharmacy(pharmacyId: string, items: CartItem[] = readCart()): boolean {
  return items.some((c) => c.pharmacyId !== pharmacyId);
}

export function cartTotal(items: CartItem[] = readCart()): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function cartCount(items: CartItem[] = readCart()): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartWithDetails(items: CartItem[] = readCart()): CartLine[] {
  return items.map((item) => ({
    item,
    product: productIndex.get(item.id),
    pharmacy: pharmacyIndex.get(item.pharmacyId),
  }));
}

export type CartGroup = {
  pharmacyId: string;
  pharmacyName: string;
  isOpen?: boolean;
  rating?: number;
  etaLabel?: string;
  items: CartLine[];
  total: number;
};

export function groupCartByPharmacy(items: CartItem[] = readCart()): CartGroup[] {
  const grouped = new Map<string, CartLine[]>();
  cartWithDetails(items).forEach((line) => {
    const key = line.item.pharmacyId;
    grouped.set(key, [...(grouped.get(key) ?? []), line]);
  });

  return Array.from(grouped.entries()).map(([pharmacyId, entries]) => {
    const pharmacy = pharmacyIndex.get(pharmacyId);
    const total = entries.reduce((sum, line) => sum + line.item.price * line.item.qty, 0);
    return {
      pharmacyId,
      pharmacyName: pharmacy?.name ?? "داروخانه",
      isOpen: pharmacy?.isOpen,
      rating: pharmacy?.rating,
      etaLabel: pharmacy
        ? `${pharmacy.deliveryEtaMin.toLocaleString("fa-IR")} تا ${pharmacy.deliveryEtaMax.toLocaleString("fa-IR")} دقیقه`
        : undefined,
      items: entries,
      total,
    };
  });
}

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listCartItems(),
    () => [],
  );
}

export function useCartCount(): number {
  const items = useCartItems();
  return cartCount(items);
}
