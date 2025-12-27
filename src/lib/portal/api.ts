import type { Order, OrderStatus, OrderType, PaymentMethod, SubstitutionProposal } from "@/lib/orders/types";
import type { Permission, Role } from "@/lib/rbac/types";

type PortalSession = { pharmacyId: string; pharmacyName: string; role: Role; permissions: Permission[] };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, { cache: "no-store", ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "request failed");
  }
  return res.json() as Promise<T>;
}

export const portalApi = {
  async me(): Promise<PortalSession> {
    return request<PortalSession>("/api/portal/me");
  },
  async listOrders(filters?: { tab?: string; q?: string; type?: OrderType; payment?: PaymentMethod }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.tab) params.set("tab", filters.tab);
    if (filters?.q) params.set("q", filters.q);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.payment) params.set("payment", filters.payment);
    const search = params.toString() ? `?${params.toString()}` : "";
    return request<{ orders: Order[] }>(`/api/portal/orders${search}`).then((r) => r.orders ?? []);
  },
  async getOrder(id: string): Promise<Order> {
    return request<{ order: Order }>(`/api/portal/orders/${id}`).then((r) => r.order);
  },
  async acceptOrder(id: string, etaMinutes?: number): Promise<Order> {
    return request<{ order: Order }>(`/api/portal/orders/${id}/accept`, {
      method: "POST",
      body: JSON.stringify({ etaMinutes }),
    }).then((r) => r.order);
  },
  async rejectOrder(id: string, reason: string): Promise<Order> {
    return request<{ order: Order }>(`/api/portal/orders/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }).then((r) => r.order);
  },
  async updateStatus(id: string, nextStatus: OrderStatus): Promise<Order> {
    return request<{ order: Order }>(`/api/portal/orders/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ nextStatus }),
    }).then((r) => r.order);
  },
  async saveSubstitution(id: string, proposal: Omit<SubstitutionProposal, "id"> & { id?: string }): Promise<Order> {
    return request<{ order: Order }>(`/api/portal/orders/${id}/substitutions`, {
      method: "POST",
      body: JSON.stringify({ proposal }),
    }).then((r) => r.order);
  },
  async reviewPrescription(id: string, reviewStatus: string, note?: string): Promise<Order> {
    return request<{ order: Order }>(`/api/portal/prescriptions/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ reviewStatus, note }),
    }).then((r) => r.order);
  },
  async listInventory(): Promise<any[]> {
    return request<{ inventory: any[] }>("/api/portal/inventory").then((r) => r.inventory ?? []);
  },
  async createInventoryItem(payload: any): Promise<any> {
    return request<{ item: any }>("/api/portal/inventory", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.item ?? payload);
  },
  async updateInventoryItem(productId: string, payload: any): Promise<any> {
    return request<{ item: any }>(`/api/portal/inventory/${productId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.item ?? payload);
  },
  async adjustInventory(productId: string, delta: number): Promise<any> {
    return request<{ item: any }>("/api/portal/inventory", {
      method: "POST",
      body: JSON.stringify({ productId, delta }),
    }).then((r) => r.item ?? null);
  },
  async listCatalog(): Promise<any[]> {
    return request<{ products: any[] }>("/api/portal/catalog").then((r) => r.products ?? []);
  },
  async listSettlements(): Promise<any[]> {
    return request<{ settlements: any[] }>("/api/portal/settlements").then((r) => r.settlements ?? []);
  },
  async listTickets(): Promise<any[]> {
    return request<{ tickets: any[] }>("/api/portal/tickets").then((r) => r.tickets ?? []);
  },
};
