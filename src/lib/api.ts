import { mockStore } from "@/lib/mock/store";
import type { AccessGrant, Address, Order, Pharmacy, Prescription, Product } from "@/lib/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const api = {
  async listPharmacies(): Promise<Pharmacy[]> {
    await delay(150);
    return mockStore.getPharmacies();
  },
  async getPharmacy(slug: string): Promise<Pharmacy | undefined> {
    await delay(120);
    return mockStore.getPharmacyBySlug(slug);
  },
  async listProducts(pharmacyId?: string): Promise<Product[]> {
    await delay(140);
    if (pharmacyId) return mockStore.getProductsByPharmacy(pharmacyId);
    return mockStore.listProducts();
  },
  async getProduct(id: string): Promise<Product | undefined> {
    await delay(120);
    return mockStore.getProductById(id);
  },
  async listPrescriptions(): Promise<Prescription[]> {
    await delay(120);
    return mockStore.listPrescriptions("user-1");
  },
  async createPrescription(data: Omit<Prescription, "id" | "createdAt" | "status">): Promise<Prescription> {
    await delay(180);
    return mockStore.createPrescription(data);
  },
  async listAccessGrants(): Promise<AccessGrant[]> {
    await delay(80);
    return mockStore.listAccessGrants("user-1");
  },
  async createAccessGrant(input: Omit<AccessGrant, "id">): Promise<AccessGrant> {
    await delay(80);
    return mockStore.createAccessGrant(input);
  },
  async deleteAccessGrant(id: string) {
    await delay(80);
    return mockStore.revokeAccessGrant(id);
  },
  async listOrders(): Promise<Order[]> {
    await delay(160);
    return mockStore.listOrders("user-1");
  },
  async createOrder(order: Order): Promise<Order> {
    await delay(160);
    return mockStore.createOrder(order);
  },
  async cancelOrder(id: string, reason: string) {
    await delay(140);
    return mockStore.cancelOrder(id, reason);
  },
  async listAddresses(): Promise<Address[]> {
    await delay(120);
    return mockStore.listAddresses();
  },
  async createAddress(address: Address): Promise<Address> {
    await delay(160);
    return mockStore.createAddress(address);
  },
  async updateAddress(id: string, data: Partial<Address>) {
    await delay(120);
    return mockStore.updateAddress(id, data);
  },
  async deleteAddress(id: string) {
    await delay(120);
    return mockStore.deleteAddress(id);
  },
  async getAddress(id: string): Promise<Address | undefined> {
    await delay(80);
    return mockStore.getAddressById(id);
  },
  async requestUploadSignedUrl(fileName: string): Promise<{ uploadUrl: string; previewUrl: string }> {
    await delay(120);
    const previewUrl = `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80&sig=${fileName}`;
    return {
      uploadUrl: `https://uploads.mock.darunow/${fileName}?signature=mocked`,
      previewUrl,
    };
  },
  async getPrescriptionSignedUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    await delay(100);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const url = `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80&sig=${id}`;
    return { url, expiresAt };
  },
};
