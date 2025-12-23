import {
  seedAccessGrants,
  seedAddresses,
  seedOrders,
  seedPharmacies,
  seedPrescriptions,
  seedProducts,
} from "@/lib/mock/seed";
import type {
  AccessGrant,
  Address,
  Order,
  Pharmacy,
  Prescription,
  Product,
} from "@/lib/types";

// In-memory singleton store for mock operations
const db = {
  pharmacies: [...seedPharmacies],
  products: [...seedProducts],
  prescriptions: [...seedPrescriptions],
  accessGrants: [...seedAccessGrants],
  orders: [...seedOrders],
  addresses: [...seedAddresses],
};

export const mockStore = {
  getPharmacies: () => db.pharmacies,
  getPharmacyBySlug: (slug: string) => db.pharmacies.find((p) => p.slug === slug),
  getProductsByPharmacy: (pharmacyId: string) => db.products.filter((p) => p.pharmacyId === pharmacyId),
  getProductById: (id: string) => db.products.find((p) => p.id === id),
  listProducts: () => db.products,

  listPrescriptions: (ownerId: string) => db.prescriptions.filter((p) => p.ownerId === ownerId),
  createPrescription: (data: Omit<Prescription, "id" | "createdAt" | "status">): Prescription => {
    const record: Prescription = {
      ...data,
      id: `rx-${Date.now()}`,
      status: "فعال",
      createdAt: new Date().toISOString(),
    };
    db.prescriptions.unshift(record);
    return record;
  },
  deletePrescription: (id: string) => {
    const idx = db.prescriptions.findIndex((p) => p.id === id);
    if (idx >= 0) db.prescriptions.splice(idx, 1);
  },

  listAccessGrants: (ownerId: string) =>
    db.accessGrants.filter((g) => db.prescriptions.find((p) => p.id === g.prescriptionId && p.ownerId === ownerId)),
  createAccessGrant: (input: Omit<AccessGrant, "id">): AccessGrant => {
    const record: AccessGrant = { ...input, id: `grant-${Date.now()}` };
    db.accessGrants.unshift(record);
    return record;
  },
  revokeAccessGrant: (id: string) => {
    const idx = db.accessGrants.findIndex((g) => g.id === id);
    if (idx >= 0) db.accessGrants.splice(idx, 1);
  },

  listOrders: (ownerId: string) => db.orders, // owner not used in mock
  getOrderById: (id: string) => db.orders.find((o) => o.id === id),
  createOrder: (order: Order) => {
    db.orders.unshift(order);
    return order;
  },
  cancelOrder: (id: string, reason: string) => {
    const order = db.orders.find((o) => o.id === id);
    if (order) {
      order.status = "لغو شد";
    }
    return order;
  },

  listAddresses: () => db.addresses,
  getAddressById: (id: string) => db.addresses.find((a) => a.id === id),
  createAddress: (input: Address) => {
    db.addresses.unshift(input);
    return input;
  },
  updateAddress: (id: string, data: Partial<Address>) => {
    const target = db.addresses.find((a) => a.id === id);
    if (target) Object.assign(target, data);
    return target;
  },
  deleteAddress: (id: string) => {
    const idx = db.addresses.findIndex((a) => a.id === id);
    if (idx >= 0) db.addresses.splice(idx, 1);
  },
};
