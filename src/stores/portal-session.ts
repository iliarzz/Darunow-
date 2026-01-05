import { useSyncExternalStore } from "react";
import type { Permission, Role } from "@/lib/rbac/types";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";

export type PortalSession = {
  token: string;
  pharmacyId: string;
  pharmacyName: string;
  role: Role;
  permissions: Permission[];
};

const STORAGE_KEY = versionedKey("darunow.portal.session", "v1");
let cached: PortalSession | null = null;
let lastRaw: string | null = null;
let initialized = false;

function readSession(): PortalSession | null {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cached;
  lastRaw = raw;
  cached = safeJsonParse<PortalSession | null>(raw, null);
  initialized = true;
  return cached;
}

function writeSession(next: PortalSession | null): void {
  cached = next;
  initialized = true;
  lastRaw = safeJsonStringify(next);
  setItem(STORAGE_KEY, lastRaw);
}

export function setPortalSession(session: PortalSession): void {
  writeSession(session);
}

export function clearPortalSession(): void {
  writeSession(null);
}

export function getPortalSession(): PortalSession | null {
  return readSession();
}

export function usePortalSession(): PortalSession | null {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => readSession(),
    () => null,
  );
}
