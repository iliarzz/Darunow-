import { useSyncExternalStore } from "react";
import { z } from "zod";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";

const STORAGE_KEY = versionedKey("darunow.favorites", "v1");

const favoritesSchema = z.object({
  pharmacyIds: z.array(z.string()),
});

type FavoriteState = z.infer<typeof favoritesSchema>;

const defaultState: FavoriteState = { pharmacyIds: [] };

let cachedState: FavoriteState = defaultState;
let lastRaw: string | null = null;
let initialized = false;

function readState(): FavoriteState {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedState;
  lastRaw = raw;
  const parsed = favoritesSchema.safeParse(safeJsonParse<FavoriteState>(raw, defaultState));
  cachedState = parsed.success ? parsed.data : defaultState;
  initialized = true;
  return cachedState;
}

function writeState(state: FavoriteState): void {
  cachedState = state;
  initialized = true;
  lastRaw = safeJsonStringify(state);
  setItem(STORAGE_KEY, lastRaw);
}

export function listFavorites(): FavoriteState {
  return readState();
}

export function toggleFavorite(pharmacyId: string): FavoriteState {
  const state = readState();
  const exists = state.pharmacyIds.includes(pharmacyId);
  const next = exists
    ? { pharmacyIds: state.pharmacyIds.filter((id) => id !== pharmacyId) }
    : { pharmacyIds: [pharmacyId, ...state.pharmacyIds] };
  writeState(next);
  return next;
}

export function useFavorites(): FavoriteState {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listFavorites(),
    () => defaultState,
  );
}
