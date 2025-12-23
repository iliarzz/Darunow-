import type { Address, Order, Ticket } from "@/lib/types-v2";
import type { Pharmacy, Product } from "@/lib/types";
import { mockStore } from "@/lib/mock/store";
import { getAuth, setAuth, clearAuth } from "@/stores/auth";

const DEMO_PHONE = process.env.NEXT_PUBLIC_DEMO_PHONE || "09120000000";
const DEMO_OTP = process.env.NEXT_PUBLIC_STATIC_OTP || "123456";

let authPromise: Promise<string | undefined> | null = null;

async function ensureAuthToken(): Promise<string | undefined> {
  if (typeof window === "undefined") return getAuth().token;
  const current = getAuth().token;
  if (current) return current;
  if (authPromise) return authPromise;
  authPromise = fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: DEMO_PHONE, code: DEMO_OTP }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("auth failed");
      const data = await res.json();
      if (data?.token) setAuth({ token: data.token, user: data.user });
      return data?.token as string | undefined;
    })
    .catch(() => undefined)
    .finally(() => {
      authPromise = null;
    });
  return authPromise;
}

async function apiFetch<T>(path: string, options: any = {}, opts: { auth?: boolean } = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const requiresAuth = opts.auth !== false;
  if (requiresAuth) {
    const token = await ensureAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData) && typeof options.body !== "string") {
    headers.set("Content-Type", "application/json");
    options = { ...options, body: JSON.stringify(options.body) };
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401 && requiresAuth) {
    clearAuth();
    const retryToken = await ensureAuthToken();
    if (retryToken) {
      headers.set("Authorization", `Bearer ${retryToken}`);
      const retryRes = await fetch(path, { ...options, headers });
      if (retryRes.ok) {
        return retryRes.json() as Promise<T>;
      }
      throw new Error(await retryRes.text());
    }
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "api error");
  }
  return res.json() as Promise<T>;
}

function mapProduct(raw: any): Product {
  return {
    id: raw.id,
    pharmacyId: raw.pharmacyId,
    nameFa: raw.name ?? raw.nameFa ?? "محصول",
    dosageFa: raw.subtitle ?? raw.dosageFa ?? "",
    priceToman: raw.price ?? raw.priceToman ?? 0,
    rxRequired: raw.rxRequired ?? false,
    stock: raw.stock ?? (raw.inStock === false ? 0 : 50),
    descriptionFa: raw.description ?? raw.descriptionFa ?? "",
    warningsFa: raw.warningsFa ?? [],
    categoryFa: raw.category ?? raw.categoryFa ?? "عمومی",
  };
}

export const api = {
  async listPharmacies(): Promise<Pharmacy[]> {
    return apiFetch<Pharmacy[]>("/api/pharmacies", {}, { auth: false });
  },
  async getPharmacy(slug: string): Promise<Pharmacy | undefined> {
    try {
      return await apiFetch<Pharmacy>(`/api/pharmacies/${slug}`, {}, { auth: false });
    } catch {
      return undefined;
    }
  },
  async listProducts(pharmacyId?: string): Promise<Product[]> {
    if (pharmacyId) {
      const res = await apiFetch<any[]>(`/api/pharmacies/${pharmacyId}/products`, {}, { auth: false });
      return res.map(mapProduct);
    }
    const res = await apiFetch<any[]>(`/api/products`, {}, { auth: false });
    return res.map(mapProduct);
  },
  async getProduct(id: string): Promise<Product | undefined> {
    const res = await apiFetch<any>(`/api/products/${id}`, {}, { auth: false }).catch(() => undefined);
    return res ? mapProduct(res) : undefined;
  },
  async listOrders(): Promise<Order[]> {
    return apiFetch<Order[]>("/api/orders");
  },
  async getOrder(id: string): Promise<Order | undefined> {
    return apiFetch<Order>(`/api/orders/${id}`);
  },
  async createOrder(order: any): Promise<Order> {
    return apiFetch<Order>("/api/orders", { method: "POST", body: order });
  },
  async listAddresses(): Promise<Address[]> {
    return apiFetch<Address[]>("/api/addresses");
  },
  async createAddress(address: Partial<Address>): Promise<Address> {
    return apiFetch<Address>("/api/addresses", { method: "POST", body: address });
  },
  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    return apiFetch<Address>(`/api/addresses/${id}`, { method: "PUT", body: data });
  },
  async deleteAddress(id: string) {
    return apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
  },
  async getAddress(id: string): Promise<Address | undefined> {
    return apiFetch<Address>(`/api/addresses/${id}`);
  },
  async listTickets(): Promise<Ticket[]> {
    return apiFetch<Ticket[]>("/api/tickets");
  },
  async createTicket(input: { subject: string; message: string; orderId?: string }): Promise<Ticket> {
    return apiFetch<Ticket>("/api/tickets", { method: "POST", body: input });
  },
  async replyTicket(id: string, text: string): Promise<Ticket> {
    return apiFetch<Ticket>(`/api/tickets/${id}`, { method: "POST", body: { text } });
  },
  async listFavorites(): Promise<{ pharmacyId: string }[]> {
    return apiFetch("/api/favorites");
  },
  async addFavorite(pharmacyId: string) {
    return apiFetch(`/api/favorites/${pharmacyId}`, { method: "POST" });
  },
  async removeFavorite(pharmacyId: string) {
    return apiFetch(`/api/favorites/${pharmacyId}`, { method: "DELETE" });
  },
  async listRatings() {
    return apiFetch("/api/ratings");
  },
  async createRating(input: { orderId: string; pharmacyId: string; score: number; note?: string }) {
    return apiFetch("/api/ratings", { method: "POST", body: input });
  },
  async requestUploadSignedUrl(fileName: string): Promise<{ uploadUrl: string; previewUrl: string }> {
    const previewUrl = `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80&sig=${fileName}`;
    return {
      uploadUrl: `https://uploads.mock.darunow/${fileName}?signature=mocked`,
      previewUrl,
    };
  },
  async getPrescriptionSignedUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const url = `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80&sig=${id}`;
    return { url, expiresAt };
  },
  async listPrescriptions() {
    return mockStore.listPrescriptions("user-1");
  },
  async createPrescription(data: any) {
    return mockStore.createPrescription(data);
  },
  async listAccessGrants() {
    return mockStore.listAccessGrants("user-1");
  },
  async createAccessGrant(input: any) {
    return mockStore.createAccessGrant(input);
  },
  async deleteAccessGrant(id: string) {
    return mockStore.revokeAccessGrant(id);
  },
};
