import { calculateOrderTotal } from "./calc";
import { assertValidTransition } from "./status";
import type { Order, OrderStatus, SubstitutionProposal } from "./types";

let orders: Order[] = seedOrders();

export function listOrders(filter?: { status?: OrderStatus | OrderStatus[]; pharmacyId?: string }): Order[] {
  let result = [...orders];
  if (filter?.pharmacyId) {
    result = result.filter((order) => order.pharmacyId === filter.pharmacyId);
  }
  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    result = result.filter((order) => statuses.includes(order.status));
  }
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

export function getOrder(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export function acceptOrder(id: string, etaMinutes?: number): Order | undefined {
  return updateOrder(id, (order) => {
    const stagedStatus: OrderStatus = order.status === "PLACED" ? "PHARMACY_REVIEW" : order.status;
    if (stagedStatus !== order.status) {
      assertValidTransition(order.status, stagedStatus);
    }
    assertValidTransition(stagedStatus, "PHARMACY_ACCEPTED");
    return { ...order, status: "PHARMACY_ACCEPTED", etaMinutes: etaMinutes ?? order.etaMinutes };
  });
}

export function rejectOrder(id: string, reason?: string): Order | undefined {
  return updateOrder(id, (order) => {
    const stagedStatus: OrderStatus = order.status === "PLACED" ? "PHARMACY_REVIEW" : order.status;
    if (stagedStatus !== order.status) {
      assertValidTransition(order.status, stagedStatus);
    }
    assertValidTransition(stagedStatus, "PHARMACY_REJECTED");
    return { ...order, status: "PHARMACY_REJECTED", internalNote: reason ?? order.internalNote };
  });
}

export function updateOrderStatus(id: string, nextStatus: OrderStatus, options?: { reason?: string; etaMinutes?: number }): Order | undefined {
  return updateOrder(id, (order) => {
    assertValidTransition(order.status, nextStatus);
    return {
      ...order,
      status: nextStatus,
      internalNote: options?.reason ?? order.internalNote,
      etaMinutes: options?.etaMinutes ?? order.etaMinutes,
    };
  });
}

export function addSubstitution(orderId: string, proposal: Omit<SubstitutionProposal, "id">): Order | undefined {
  return updateOrder(orderId, (order) => {
    const nextProposal: SubstitutionProposal = { ...proposal, id: createId("sub") };
    const existing = order.substitutions?.filter((sub) => sub.originalItemId !== proposal.originalItemId) ?? [];
    return { ...order, substitutions: [...existing, nextProposal] };
  });
}

export function removeSubstitution(orderId: string, substitutionId: string): Order | undefined {
  return updateOrder(orderId, (order) => {
    const next = order.substitutions?.filter((sub) => sub.id !== substitutionId) ?? [];
    return { ...order, substitutions: next };
  });
}

function updateOrder(id: string, updater: (order: Order) => Order): Order | undefined {
  let updated: Order | undefined;
  orders = orders.map((order) => {
    if (order.id !== id) return order;
    const next = normalizeOrder(updater(order));
    updated = next;
    return next;
  });
  return updated;
}

function normalizeOrder(order: Order): Order {
  const next: Order = {
    ...order,
    total: calculateOrderTotal(order.items, order.substitutions),
    updatedAt: Date.now(),
  };
  return next;
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type SeedOrder = Omit<Order, "total" | "substitutions" | "audit"> & {
  substitutions?: Order["substitutions"];
  audit?: Order["audit"];
};

function seedOrders(): Order[] {
  const now = Date.now();
  const minutes = (m: number) => m * 60 * 1000;
  const base: SeedOrder[] = [
    {
      id: "ord-201",
      type: "standard",
      status: "PLACED",
      createdAt: now - minutes(30),
      updatedAt: now - minutes(30),
      pharmacyId: "pharm-velocity",
      pharmacyName: "داروخانه ولوسیتی",
      customerName: "سارا ناصری",
      customerPhone: "09120001122",
      deliveryAddressText: "تهران، ونک، ملاصدرا، پلاک ۱۲",
      paymentMethod: "online_shaparak",
      paymentStatus: "PENDING",
      items: [
        { id: "itm-1", name: "آتورواستاتین ۲۰", qty: 1, unitPrice: 185000 },
        { id: "itm-2", name: "ایبوپروفن سریع", qty: 2, unitPrice: 82000 },
      ],
      etaMinutes: undefined,
    },
    {
      id: "ord-202",
      type: "prescription",
      status: "PHARMACY_REVIEW",
      createdAt: now - minutes(55),
      updatedAt: now - minutes(55),
      pharmacyId: "pharm-darunow",
      pharmacyName: "داروخانه منتخب دارونَو",
      customerName: "مانی احدی",
      customerPhone: "09123334444",
      deliveryAddressText: "تهران، سعادت‌آباد، بلوار سرو",
      paymentMethod: "cod_card_reader",
      paymentStatus: "COD",
      items: [
        { id: "itm-3", name: "آموکسی‌سیلین ۵۰۰", qty: 1, unitPrice: 120000, requiresPrescription: true },
        { id: "itm-4", name: "شربت سیتریزین", qty: 1, unitPrice: 85000, requiresPrescription: true },
      ],
      prescription: {
        id: "rx-202",
        imageUrls: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
        ],
        noteToPharmacist: "لطفا با قرص خارجی جایگزین کنید اگر موجود نبود.",
      },
      etaMinutes: 60,
    },
    {
      id: "ord-203",
      type: "standard",
      status: "PHARMACY_ACCEPTED",
      createdAt: now - minutes(80),
      updatedAt: now - minutes(80),
      pharmacyId: "pharm-luma",
      pharmacyName: "داروخانه لُما",
      customerName: "الهام موسوی",
      customerPhone: "09125556677",
      deliveryAddressText: "تهران، زعفرانیه، بلوار الف",
      paymentMethod: "card_to_card",
      paymentStatus: "SUCCESS",
      items: [
        { id: "itm-5", name: "ویتامین D3", qty: 1, unitPrice: 98000 },
        { id: "itm-6", name: "ماسک سه لایه", qty: 3, unitPrice: 12000 },
      ],
      substitutions: [
        {
          id: "sub-203-1",
          originalItemId: "itm-5",
          suggestedName: "ویتامین D3 برند جایگزین",
          suggestedUnitPrice: 92000,
          reason: "صرفه اقتصادی",
        },
      ],
      etaMinutes: 45,
    },
    {
      id: "ord-204",
      type: "prescription",
      status: "PREPARING",
      createdAt: now - minutes(140),
      updatedAt: now - minutes(140),
      pharmacyId: "pharm-velocity",
      pharmacyName: "داروخانه ولوسیتی",
      customerName: "محمد حسینی",
      deliveryAddressText: "تهران، پاسداران، بوستان نهم",
      paymentMethod: "online_shaparak",
      paymentStatus: "SUCCESS",
      items: [
        { id: "itm-7", name: "انسولین قلمی", qty: 2, unitPrice: 240000, requiresPrescription: true },
        { id: "itm-8", name: "پنبه پزشکی", qty: 1, unitPrice: 35000 },
      ],
      prescription: {
        id: "rx-204",
        imageUrls: [
          "https://images.unsplash.com/photo-1580281657521-3f3c3a7a4136?auto=format&fit=crop&w=900&q=80",
        ],
      },
      etaMinutes: 35,
    },
    {
      id: "ord-205",
      type: "standard",
      status: "READY_FOR_DISPATCH",
      createdAt: now - minutes(200),
      updatedAt: now - minutes(200),
      pharmacyId: "pharm-city",
      pharmacyName: "داروخانه شهر",
      customerName: "مهسا کیانی",
      deliveryAddressText: "تهران، جردن، بلوار آفریقا",
      paymentMethod: "online_shaparak",
      paymentStatus: "SUCCESS",
      items: [
        { id: "itm-9", name: "کرم ضدآفتاب", qty: 1, unitPrice: 215000 },
        { id: "itm-10", name: "نوار بهداشتی", qty: 2, unitPrice: 65000 },
      ],
      etaMinutes: 20,
    },
    {
      id: "ord-206",
      type: "prescription",
      status: "DISPATCHED",
      createdAt: now - minutes(260),
      updatedAt: now - minutes(260),
      pharmacyId: "pharm-night",
      pharmacyName: "داروخانه شبانه‌روزی",
      customerName: "حمید رحمانی",
      deliveryAddressText: "کرج، گوهردشت، بلوار موذن",
      paymentMethod: "cod_card_reader",
      paymentStatus: "COD",
      items: [
        { id: "itm-11", name: "آزیترومایسین ۲۵۰", qty: 1, unitPrice: 165000, requiresPrescription: true },
        { id: "itm-12", name: "سرم شستشو ۵۰۰ml", qty: 2, unitPrice: 48000 },
      ],
      prescription: {
        id: "rx-206",
        imageUrls: [
          "https://images.unsplash.com/photo-1582719478241-02d01e34b47f?auto=format&fit=crop&w=900&q=80",
        ],
      },
      etaMinutes: 18,
    },
    {
      id: "ord-207",
      type: "standard",
      status: "DELIVERED",
      createdAt: now - minutes(400),
      updatedAt: now - minutes(400),
      pharmacyId: "pharm-green",
      pharmacyName: "داروخانه سبز",
      customerName: "نگار عباسی",
      deliveryAddressText: "اصفهان، چهارباغ بالا",
      paymentMethod: "online_shaparak",
      paymentStatus: "SUCCESS",
      items: [
        { id: "itm-13", name: "سرم مو", qty: 1, unitPrice: 320000 },
        { id: "itm-14", name: "قرص مولتی ویتامین", qty: 1, unitPrice: 175000 },
      ],
      etaMinutes: 0,
    },
    {
      id: "ord-208",
      type: "prescription",
      status: "PHARMACY_REJECTED",
      createdAt: now - minutes(520),
      updatedAt: now - minutes(520),
      pharmacyId: "pharm-luma",
      pharmacyName: "داروخانه لُما",
      customerName: "علی رادمهر",
      deliveryAddressText: "شیراز، ستارخان",
      paymentMethod: "online_shaparak",
      paymentStatus: "FAILED",
      items: [{ id: "itm-15", name: "قرص ناپروکسن", qty: 1, unitPrice: 110000, requiresPrescription: true }],
      prescription: {
        id: "rx-208",
        imageUrls: [
          "https://images.unsplash.com/photo-1580281658627-8b90bc0e1a5d?auto=format&fit=crop&w=900&q=80",
        ],
        noteToPharmacist: "داروخانه دیگر پیشنهاد شود",
      },
      internalNote: "نسخه ناخوانا",
    },
  ];

  return base
    .map((order) => ({
      ...order,
      substitutions: order.substitutions ?? [],
      audit: order.audit ?? [],
      total: calculateOrderTotal(order.items, order.substitutions ?? []),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}
