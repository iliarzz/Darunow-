import type { Address, AddressDraft } from "./types";

const ACTIVE_KEY = "darunow_active_address_v1";
const DRAFT_KEY = "darunow_address_draft_v1";

export function getActiveAddress(): Address | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Address;
  } catch {
    return null;
  }
}

export function setActiveAddress(a: Address): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
  } catch {
    // ignore
  }
}

export function clearActiveAddress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore
  }
}

export function getDraft(): AddressDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AddressDraft;
  } catch {
    return null;
  }
}

export function setDraft(d: AddressDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // ignore
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
