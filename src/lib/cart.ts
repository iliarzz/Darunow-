import { seedProducts } from "@/lib/mock/seed";
import type { CartItem } from "@/stores/cart";

const productIndex = new Map(seedProducts.map((p) => [p.id, p]));

export const getCartProducts = (items: CartItem[]) =>
  items
    .map((item) => {
      const product = productIndex.get(item.id);
      if (!product) return null;
      return { item, product };
    })
    .filter(Boolean) as { item: CartItem; product: (typeof seedProducts)[number] }[];

export const getCartTotal = (items: CartItem[]) =>
  items.reduce((sum, entry) => sum + entry.price * entry.qty, 0);

export const cartRequiresRx = (items: CartItem[]) =>
  items.some((entry) => productIndex.get(entry.id)?.rxRequired);
