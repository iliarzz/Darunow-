import { listCartItems } from "@/stores/cart";
import { listPayments } from "@/stores/payment";
import { listOrders } from "@/stores/orders";
import { listTickets } from "@/stores/tickets";
import { listReminders } from "@/stores/reminders";
import { listFavorites } from "@/stores/favorites";
import { listRatings } from "@/stores/ratings";
import { listAddresses } from "@/stores/address";
import { getCheckoutSession } from "@/stores/checkout-session";
import { getCheckoutPrefs } from "@/stores/checkout-prefs";

export function migrateStorage(): void {
  try {
    listCartItems();
    listPayments();
    listOrders();
    listTickets();
    listReminders();
    listFavorites();
    listRatings();
    listAddresses();
    getCheckoutSession();
    getCheckoutPrefs();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("migrateStorage warning", err);
    }
  }
}
