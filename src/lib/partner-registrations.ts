export type PartnerRegistrationType = "waitlist" | "pharmacy" | "clinic" | "hospital";
export type PartnerRegistrationStatus = "pending" | "approved" | "denied";
export type PartnerRegistrationSource = "user" | "admin";

export type PartnerRegistration = {
  id: string;
  type: PartnerRegistrationType;
  name: string;
  managerName?: string;
  city?: string;
  phone?: string;
  email?: string;
  note?: string;
  internalNote?: string;
  extra?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
  status: PartnerRegistrationStatus;
  createdBy?: PartnerRegistrationSource;
};

const STORAGE_KEY = "darunow_partner_registrations";

const safeParse = (value: string | null): PartnerRegistration[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PartnerRegistration[]) : [];
  } catch {
    return [];
  }
};

export const createRegistrationId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `reg_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
};

export const getRegistrations = (): PartnerRegistration[] => {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY));
};

export const saveRegistrations = (items: PartnerRegistration[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addRegistration = (entry: PartnerRegistration) => {
  const items = getRegistrations();
  const next = [entry, ...items];
  saveRegistrations(next);
  return next;
};

export const updateRegistrationStatus = (id: string, status: PartnerRegistrationStatus) => {
  const items = getRegistrations();
  const timestamp = new Date().toISOString();
  const next = items.map((item) => (item.id === id ? { ...item, status, updatedAt: timestamp } : item));
  saveRegistrations(next);
  return next;
};

export const updateRegistration = (id: string, patch: Partial<PartnerRegistration>) => {
  const items = getRegistrations();
  const timestamp = new Date().toISOString();
  const next = items.map((item) =>
    item.id === id ? { ...item, ...patch, updatedAt: timestamp } : item
  );
  saveRegistrations(next);
  return next;
};

export const bulkUpdateStatus = (ids: string[], status: PartnerRegistrationStatus) => {
  const idSet = new Set(ids);
  const timestamp = new Date().toISOString();
  const items = getRegistrations();
  const next = items.map((item) =>
    idSet.has(item.id) ? { ...item, status, updatedAt: timestamp } : item
  );
  saveRegistrations(next);
  return next;
};

export const removeRegistrations = (ids: string[]) => {
  const idSet = new Set(ids);
  const items = getRegistrations();
  const next = items.filter((item) => !idSet.has(item.id));
  saveRegistrations(next);
  return next;
};

export const clearRegistrations = () => {
  saveRegistrations([]);
  return [];
};
