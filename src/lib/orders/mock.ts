import type { Order } from "./types";
import { listOrders } from "./store";

// Expose the seeded orders for components/tests that rely on mock data.
export const mockOrders: Order[] = listOrders();
