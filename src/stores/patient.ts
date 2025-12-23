import { useSyncExternalStore } from "react";
import { z } from "zod";
import {
  getItem,
  safeJsonParse,
  safeJsonStringify,
  setItem,
  subscribe,
  versionedKey,
} from "@/lib/storage";
import type { PatientProfile } from "@/lib/types-v2";

const STORAGE_KEY = versionedKey("darunow.patient", "v1");
let cachedProfile: PatientProfile | null = null;
let lastRaw: string | null = null;
let initialized = false;

const profileSchema: z.ZodType<PatientProfile> = z.object({
  fullName: z.string().optional(),
  age: z.number().optional(),
  allergies: z.array(z.string()).optional(),
  chronicMeds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  updatedAt: z.number(),
});

const defaultProfile: PatientProfile = {
  allergies: [],
  chronicMeds: [],
  updatedAt: Date.now(),
};

function readProfile(): PatientProfile {
  const raw = getItem(STORAGE_KEY);
  if (raw === lastRaw && initialized && cachedProfile) return cachedProfile;
  lastRaw = raw;
  const parsed = profileSchema.safeParse(safeJsonParse<PatientProfile>(raw, defaultProfile));
  cachedProfile = parsed.success ? parsed.data : defaultProfile;
  initialized = true;
  return cachedProfile;
}

function writeProfile(profile: PatientProfile): void {
  cachedProfile = profile;
  initialized = true;
  lastRaw = safeJsonStringify(profile);
  setItem(STORAGE_KEY, lastRaw);
}

export function getPatientProfile(): PatientProfile {
  return readProfile();
}

export function savePatientProfile(data: Partial<PatientProfile>): PatientProfile {
  const next: PatientProfile = {
    ...defaultProfile,
    ...readProfile(),
    ...data,
    updatedAt: Date.now(),
  };
  writeProfile(next);
  return next;
}

export function usePatientProfile(): PatientProfile {
  return useSyncExternalStore(
    (listener) => subscribe(STORAGE_KEY, listener),
    () => getPatientProfile(),
    () => defaultProfile,
  );
}
