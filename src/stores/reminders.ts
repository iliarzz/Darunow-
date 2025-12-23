import { useSyncExternalStore } from "react";
import { z } from "zod";
import {
  generateId,
  getItem,
  safeJsonParse,
  safeJsonStringify,
  setItem,
  subscribe,
  versionedKey,
} from "@/lib/storage";
import type { Reminder } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.reminders", "v1");
let cachedReminders: Reminder[] = [];
let lastRaw: string | null = null;
let initialized = false;

const reminderSchema: z.ZodType<Reminder> = z.object({
  id: z.string(),
  title: z.string(),
  dosage: z.string().optional(),
  times: z.array(z.string()),
  days: z.array(z.number()),
  enabled: z.boolean(),
  createdAt: z.number(),
});

const reminderListSchema = z.array(reminderSchema);

function readReminders(): Reminder[] {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized) return cachedReminders;
  lastRaw = raw;
  const parsed = reminderListSchema.safeParse(safeJsonParse<Reminder[]>(raw, []));
  cachedReminders = sortReminders(parsed.success ? parsed.data : []);
  initialized = true;
  return cachedReminders;
}

function writeReminders(list: Reminder[]): void {
  cachedReminders = sortReminders(list);
  initialized = true;
  lastRaw = safeJsonStringify(cachedReminders);
  setItem(STORAGE_KEY, lastRaw);
}

function sortReminders(list: Reminder[]): Reminder[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export function listReminders(): Reminder[] {
  return readReminders();
}

export function getReminder(id: string): Reminder | undefined {
  return readReminders().find((r) => r.id === id);
}

export function createReminder(input: Omit<Reminder, "id" | "createdAt">): Reminder {
  const record: Reminder = {
    ...input,
    id: generateId("rem"),
    createdAt: Date.now(),
  };
  const existing = readReminders();
  writeReminders([record, ...existing]);
  return record;
}

export function updateReminder(id: string, data: Partial<Omit<Reminder, "id" | "createdAt">>): Reminder | undefined {
  const existing = readReminders();
  let updated: Reminder | undefined;
  const next = existing.map((reminder) => {
    if (reminder.id !== id) return reminder;
    updated = { ...reminder, ...data };
    return updated;
  });
  if (!updated) return undefined;
  writeReminders(next);
  return updated;
}

export function toggleReminder(id: string, enabled: boolean): Reminder | undefined {
  return updateReminder(id, { enabled });
}

export function removeReminder(id: string): void {
  const remaining = readReminders().filter((r) => r.id !== id);
  writeReminders(remaining);
}

export function useReminders(): Reminder[] {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => listReminders(),
    () => [],
  );
}

export function useReminder(id?: string): Reminder | undefined {
  const reminders = useReminders();
  if (!id) return undefined;
  return reminders.find((r) => r.id === id);
}
