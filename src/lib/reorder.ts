import { addToCart, cartHasDifferentPharmacy, clearCart, listCartItems } from "@/stores/cart";
import type { Order } from "@/lib/types-v2";
import { track } from "@/lib/track";

type ReorderResult = { conflict: boolean; added: number };

export function reorderIntoCart(order: Order, opts: { forceClear?: boolean } = {}): ReorderResult {
  const current = listCartItems();
  const targetPharmacy = order.pharmacyId ?? order.items[0]?.pharmacyId;
  const hasConflict = targetPharmacy ? cartHasDifferentPharmacy(targetPharmacy, current) : current.length > 0;

  if (hasConflict && !opts.forceClear) {
    return { conflict: true, added: 0 };
  }

  if (opts.forceClear) {
    clearCart();
  }

  let added = 0;
  order.items.forEach((it, idx) => {
    if (!it.productId && !order.pharmacyId && !it.pharmacyId) return;
    addToCart({
      id: it.productId ?? `${order.id}-${idx}`,
      pharmacyId: it.pharmacyId ?? order.pharmacyId ?? "legacy-pharmacy",
      name: it.name,
      subtitle: it.subtitle,
      price: it.price,
      qty: it.qty,
    });
    added += 1;
  });

  track("reorder", { orderId: order.id, added });
  return { conflict: false, added };
}
