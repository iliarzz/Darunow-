import { useSyncExternalStore } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getItem, safeJsonParse, safeJsonStringify, setItem, subscribe, versionedKey } from "@/lib/storage";

export type Rating = {
  orderId: string;
  pharmacyId: string;
  score: number;
  note?: string;
  createdAt: number;
};

const STORAGE_KEY = versionedKey("darunow.ratings", "v1");

const ratingSchema: z.ZodType<Rating> = z.object({
  orderId: z.string(),
  pharmacyId: z.string(),
  score: z.number().min(1).max(5),
  note: z.string().optional(),
  createdAt: z.number(),
});

const ratingListSchema = z.array(ratingSchema);

let cachedRatings: Rating[] = [];
let lastRaw: string | null = null;
let initialized = false;

function readRatings(): Rating[] {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedRatings;
  lastRaw = raw;
  const parsed = ratingListSchema.safeParse(safeJsonParse<Rating[]>(raw, []));
  cachedRatings = parsed.success ? parsed.data : [];
  initialized = true;
  return cachedRatings;
}

function writeRatings(list: Rating[]): void {
  cachedRatings = list;
  initialized = true;
  lastRaw = safeJsonStringify(list);
  setItem(STORAGE_KEY, lastRaw);
}

export function listRatings(): Rating[] {
  return readRatings();
}

export function getRatingForOrder(orderId: string): Rating | undefined {
  return readRatings().find((r) => r.orderId === orderId);
}

export async function syncRatingsFromServer(): Promise<Rating[]> {
  try {
    const remote = await api.listRatings();
    const mapped: Rating[] = (remote as any[]).map((r) => ({
      orderId: r.orderId,
      pharmacyId: r.pharmacyId,
      score: r.score,
      note: r.note ?? undefined,
      createdAt:
        typeof r.createdAt === "number"
          ? r.createdAt
          : r.createdAt
            ? new Date(r.createdAt).getTime()
            : Date.now(),
    }));
    writeRatings(mapped);
    return mapped;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("ratings sync failed", err);
    }
    return readRatings();
  }
}

export async function saveRating(input: Omit<Rating, "createdAt">): Promise<Rating> {
  await api.createRating({
    orderId: input.orderId,
    pharmacyId: input.pharmacyId,
    score: input.score,
    note: input.note,
  });
  const now = Date.now();
  const remaining = readRatings().filter((r) => r.orderId !== input.orderId);
  const record: Rating = { ...input, createdAt: now };
  writeRatings([record, ...remaining]);
  return record;
}

export function useRatings(): Rating[] {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listRatings(),
    () => [],
  );
}
