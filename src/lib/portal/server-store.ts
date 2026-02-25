import { seedProducts } from "@/lib/mock/seed";

export type InventoryItem = {
  productId: string;
  name: string;
  strength?: string;
  form?: string;
  stock: number;
  lowStockThreshold?: number;
  expiresAt?: number;
  supplier?: string;
  category?: string;
  lastUpdatedAt?: number;
  lastUpdatedBy?: string;
  reorderRequested?: boolean;
};

export type SettlementItem = {
  id: string;
  period: string;
  gross: number;
  net: number;
  fees: number;
  refunds?: number;
  disputes?: number;
  status?: "paid" | "pending";
};

export type PortalTicket = {
  id: string;
  subject: string;
  status: "OPEN" | "WAITING_CUSTOMER" | "PENDING_SUPPORT" | "RESOLVED";
  lastMessageAt: number;
  slaMinutes?: number;
  messages?: { id: string; sender: string; body: string; at: number }[];
};

const now = Date.now();

let inventory: InventoryItem[] = [
  {
    productId: "sku-ator-20",
    name: "آتورواستاتین",
    strength: "20mg",
    form: "قرص",
    stock: 42,
    lowStockThreshold: 12,
    expiresAt: now + 180 * 24 * 60 * 60 * 1000,
    supplier: "تامین دارو البرز",
    category: "قلب",
    reorderRequested: false,
    lastUpdatedAt: now - 4 * 60 * 60 * 1000,
    lastUpdatedBy: "owner@darunow.local",
  },
  {
    productId: "sku-ibu-400",
    name: "ایبوپروفن سریع",
    strength: "400mg",
    form: "کپسول",
    stock: 8,
    lowStockThreshold: 15,
    expiresAt: now + 70 * 24 * 60 * 60 * 1000,
    supplier: "طب تجهیز شرق",
    category: "مسکن",
    reorderRequested: true,
    lastUpdatedAt: now - 50 * 60 * 1000,
    lastUpdatedBy: "operator@darunow.local",
  },
  {
    productId: "sku-vitd3",
    name: "ویتامین D3",
    strength: "1000IU",
    form: "قرص",
    stock: 110,
    lowStockThreshold: 20,
    expiresAt: now + 320 * 24 * 60 * 60 * 1000,
    supplier: "نوین سلامت",
    category: "مکمل",
    reorderRequested: false,
    lastUpdatedAt: now - 7 * 60 * 60 * 1000,
    lastUpdatedBy: "pharmacist@darunow.local",
  },
  {
    productId: "sku-amo-500",
    name: "آموکسی‌سیلین",
    strength: "500mg",
    form: "کپسول",
    stock: 0,
    lowStockThreshold: 10,
    expiresAt: now + 120 * 24 * 60 * 60 * 1000,
    supplier: "پخش دارویی امید",
    category: "آنتی‌بیوتیک",
    reorderRequested: true,
    lastUpdatedAt: now - 2 * 60 * 60 * 1000,
    lastUpdatedBy: "owner@darunow.local",
  },
  {
    productId: "sku-insulin-pen",
    name: "انسولین قلمی",
    strength: "100IU",
    form: "تزریقی",
    stock: 14,
    lowStockThreshold: 10,
    expiresAt: now + 50 * 24 * 60 * 60 * 1000,
    supplier: "شرکت درمان گستر",
    category: "دیابت",
    reorderRequested: false,
    lastUpdatedAt: now - 3 * 60 * 60 * 1000,
    lastUpdatedBy: "pharmacist@darunow.local",
  },
];

let settlements: SettlementItem[] = [
  { id: "set-1404-11-1", period: "هفته اول بهمن ۱۴۰۴", gross: 12000000, net: 10650000, fees: 920000, refunds: 280000, disputes: 150000, status: "paid" },
  { id: "set-1404-11-2", period: "هفته دوم بهمن ۱۴۰۴", gross: 15350000, net: 13680000, fees: 1160000, refunds: 330000, disputes: 180000, status: "paid" },
  { id: "set-1404-11-3", period: "هفته سوم بهمن ۱۴۰۴", gross: 13980000, net: 12140000, fees: 1090000, refunds: 460000, disputes: 290000, status: "pending" },
  { id: "set-1404-11-4", period: "هفته چهارم بهمن ۱۴۰۴", gross: 17100000, net: 14850000, fees: 1420000, refunds: 520000, disputes: 310000, status: "pending" },
];

let tickets: PortalTicket[] = [
  {
    id: "tkt-301",
    subject: "اختلاف مبلغ در سفارش ord-204",
    status: "OPEN",
    lastMessageAt: now - 35 * 60 * 1000,
    slaMinutes: 45,
    messages: [
      { id: "msg-1", sender: "کاربر", body: "مبلغ نهایی با فاکتور هم‌خوانی ندارد.", at: now - 60 * 60 * 1000 },
      { id: "msg-2", sender: "پشتیبانی", body: "در حال بررسی هستیم.", at: now - 45 * 60 * 1000 },
    ],
  },
  {
    id: "tkt-302",
    subject: "تاخیر در پیک (ord-206)",
    status: "WAITING_CUSTOMER",
    lastMessageAt: now - 15 * 60 * 1000,
    slaMinutes: 30,
    messages: [
      { id: "msg-3", sender: "پشتیبانی", body: "با پیک هماهنگ شد، ۱۰ دقیقه دیگر تحویل می‌شود.", at: now - 15 * 60 * 1000 },
    ],
  },
  {
    id: "tkt-303",
    subject: "نسخه ناخوانا - نیاز به آپلود مجدد",
    status: "RESOLVED",
    lastMessageAt: now - 5 * 60 * 60 * 1000,
    slaMinutes: 20,
    messages: [
      { id: "msg-4", sender: "پشتیبانی", body: "نسخه جدید دریافت شد و سفارش ادامه یافت.", at: now - 5 * 60 * 60 * 1000 },
    ],
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function listInventory(): InventoryItem[] {
  return clone(inventory);
}

export function createInventoryItem(payload: InventoryItem): InventoryItem {
  const exists = inventory.some((item) => item.productId === payload.productId);
  if (exists) {
    throw new Error("این شناسه قبلا ثبت شده است.");
  }
  const created: InventoryItem = {
    ...payload,
    lastUpdatedAt: Date.now(),
    lastUpdatedBy: payload.lastUpdatedBy ?? "owner@darunow.local",
  };
  inventory = [created, ...inventory];
  return clone(created);
}

export function updateInventoryItem(productId: string, payload: Partial<InventoryItem>): InventoryItem {
  let updated: InventoryItem | null = null;
  inventory = inventory.map((item) => {
    if (item.productId !== productId) return item;
    updated = {
      ...item,
      ...payload,
      productId,
      stock: payload.stock ?? item.stock,
      lastUpdatedAt: Date.now(),
    };
    return updated;
  });
  if (!updated) {
    const created = createInventoryItem({
      productId,
      name: payload.name ?? productId,
      stock: payload.stock ?? 0,
      ...payload,
    });
    return created;
  }
  return clone(updated);
}

export function adjustInventory(productId: string, delta: number): InventoryItem {
  const existing = inventory.find((item) => item.productId === productId);
  if (!existing) {
    throw new Error("محصول یافت نشد");
  }
  return updateInventoryItem(productId, { stock: Math.max(0, (existing.stock ?? 0) + delta) });
}

export function listCatalog() {
  const products = seedProducts.slice(0, 24);
  return products.map((product) => ({
    ...product,
    inventory: inventory.find((item) => item.productId === product.id)?.stock ?? Math.floor(Math.random() * 60),
  }));
}

export function listSettlements(): SettlementItem[] {
  return clone(settlements);
}

export function listTickets(): PortalTicket[] {
  return clone(tickets);
}
