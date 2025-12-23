import { useSyncExternalStore } from "react";
import { z } from "zod";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";

export type DeliverySlot = {
  id: string;
  label: string;
  eta: string;
  fee: number;
};

export type DeliverySlotState = {
  selectedId?: string;
};

const STORAGE_KEY = versionedKey("darunow.deliverySlots", "v1");
const slotStateSchema: z.ZodType<DeliverySlotState> = z.object({
  selectedId: z.string().optional(),
});

const defaultState: DeliverySlotState = { selectedId: "express" };

let cachedState: DeliverySlotState = defaultState;
let lastRaw: string | null = null;
let initialized = false;

function readState(): DeliverySlotState {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedState;
  lastRaw = raw;
  const parsed = slotStateSchema.safeParse(safeJsonParse<DeliverySlotState>(raw, defaultState));
  cachedState = parsed.success ? parsed.data : defaultState;
  initialized = true;
  return cachedState;
}

function writeState(state: DeliverySlotState): void {
  cachedState = state;
  initialized = true;
  lastRaw = safeJsonStringify(state);
  setItem(STORAGE_KEY, lastRaw);
}

export function getSelectedSlot(): DeliverySlotState {
  return readState();
}

export function setSelectedSlot(id: string): DeliverySlotState {
  const state = { selectedId: id };
  writeState(state);
  return state;
}

export function useSelectedSlot(): DeliverySlotState {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => getSelectedSlot(),
    () => defaultState,
  );
}
