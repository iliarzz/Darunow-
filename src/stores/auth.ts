import { useSyncExternalStore } from "react";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";

type AuthUser = {
  id: string;
  phone: string;
  name?: string | null;
};

export type AuthState = {
  token?: string;
  user?: AuthUser;
};

const STORAGE_KEY = versionedKey("darunow.auth", "v1");
let cached: AuthState = {};
let lastRaw: string | null = null;
let initialized = false;

function readAuth(): AuthState {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cached;
  lastRaw = raw;
  cached = safeJsonParse<AuthState>(raw, {});
  initialized = true;
  return cached;
}

function writeAuth(next: AuthState): void {
  cached = next;
  initialized = true;
  lastRaw = safeJsonStringify(next);
  setItem(STORAGE_KEY, lastRaw);
}

export function setAuth(state: AuthState): void {
  writeAuth(state);
}

export function clearAuth(): void {
  writeAuth({});
}

export function getAuth(): AuthState {
  return readAuth();
}

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => readAuth(),
    () => ({}),
  );
}
