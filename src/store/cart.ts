"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mockStore } from "@/lib/mock/store";
import type { AccessGrant, CartItem, Order, Prescription, Product } from "@/lib/types";

type CartState = {
  items: CartItem[];
  prescriptions: Prescription[];
  accessGrants: AccessGrant[];
  orders: Order[];
  selectedPrescriptionId?: string;
  consentHours: number;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalToman: () => number;
  itemsDetailed: () => { item: CartItem; product: Product }[];
  selectPrescription: (id?: string) => void;
  addPrescription: (p: Omit<Prescription, "id" | "createdAt" | "status">) => Prescription;
  addAccessGrant: (input: Omit<AccessGrant, "id">) => AccessGrant;
  removeAccessGrant: (id: string) => void;
  removePrescription: (id: string) => void;
  addOrder: (order: Order) => void;
  setConsentHours: (h: number) => void;
  cancelOrder: (id: string, reason: string) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      prescriptions: [...mockStore.listPrescriptions("user-1")],
      accessGrants: [...mockStore.listAccessGrants("user-1")],
      orders: [...mockStore.listOrders("user-1")],
      selectedPrescriptionId: undefined,
      consentHours: 24,
      addItem: (productId, qty = 1) =>
        set((state) => {
          const exists = state.items.find((i) => i.productId === productId);
          const updated = exists
            ? state.items.map((i) =>
                i.productId === productId ? { ...i, qty: Math.max(1, i.qty + qty) } : i,
              )
            : [...state.items, { productId, qty }];
          return { items: updated };
        }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [], selectedPrescriptionId: undefined }),
      itemsDetailed: () =>
        get()
          .items.map((item) => {
            const product = mockStore.listProducts().find((p) => p.id === item.productId);
            return product ? { item, product } : null;
          })
          .filter(Boolean) as { item: CartItem; product: Product }[],
      totalToman: () =>
        get()
          .itemsDetailed()
          .map(({ item, product }) => product.priceToman * item.qty)
          .reduce((a, b) => a + b, 0),
      selectPrescription: (id) => set({ selectedPrescriptionId: id }),
      addPrescription: (p) => {
        const record = mockStore.createPrescription(p);
        set((state) => ({ prescriptions: [record, ...state.prescriptions], selectedPrescriptionId: record.id }));
        return record;
      },
      addAccessGrant: (input) => {
        const record = mockStore.createAccessGrant(input);
        set((state) => ({ accessGrants: [record, ...state.accessGrants] }));
        return record;
      },
      removePrescription: (id) => {
        mockStore.deletePrescription(id);
        set((state) => ({
          prescriptions: state.prescriptions.filter((p) => p.id !== id),
        }));
      },
      removeAccessGrant: (id) => {
        mockStore.revokeAccessGrant(id);
        set((state) => ({
          accessGrants: state.accessGrants.filter((g) => g.id !== id),
        }));
      },
      addOrder: (order) => {
        mockStore.createOrder(order);
        set((state) => ({ orders: [order, ...state.orders], items: [] }));
      },
      cancelOrder: (id, reason) => {
        mockStore.cancelOrder(id, reason);
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: "لغو شد" } : o)),
        }));
      },
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      setConsentHours: (h) => set({ consentHours: h }),
    }),
    {
      name: "darunow-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
              clear: () => {},
              key: () => null,
              length: 0,
            } as Storage),
      ),
      partialize: (state) => ({
        items: state.items,
        prescriptions: state.prescriptions,
        accessGrants: state.accessGrants,
        orders: state.orders,
        selectedPrescriptionId: state.selectedPrescriptionId,
        consentHours: state.consentHours,
      }),
    },
  ),
);
