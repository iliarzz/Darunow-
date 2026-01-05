"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildAddressDisplay } from "@/lib/location/display";
import { clearActiveAddress, clearDraft, getActiveAddress, getDraft, setActiveAddress as persistActiveAddress, setDraft } from "@/lib/location/storage";
import type { Address, AddressAdmin, AddressDetails, AddressDraft, GeoPoint } from "@/lib/location/types";

type SaveDraftInput = {
  admin: AddressAdmin;
  details: AddressDetails;
  label?: Address["label"];
  place?: Address["place"];
};

type LocationContextValue = {
  activeAddress: Address | null;
  draft: AddressDraft | null;
  draftReady: boolean;
  startAddressWizard: (returnUrl?: string) => void;
  setDraftGeo: (geo: GeoPoint, returnUrl?: string) => void;
  updateDraft: (partial: Partial<AddressDraft>) => void;
  saveDraftAsActiveAddress: (input: SaveDraftInput) => Address | null;
  clearAddress: () => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeAddress, setActiveAddressState] = useState<Address | null>(null);
  const [draft, setDraftState] = useState<AddressDraft | null>(null);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    const stored = getActiveAddress();
    if (stored) setActiveAddressState(stored);
    const storedDraft = getDraft();
    if (storedDraft) setDraftState(storedDraft);
    setDraftReady(true);
  }, []);

  const updateDraft = (partial: Partial<AddressDraft>) => {
    const next: AddressDraft = {
      ...(draft ?? { startedAt: Date.now() }),
      ...partial,
    };
    setDraftState(next);
    setDraft(next);
  };

  const startAddressWizard = (returnUrl?: string) => {
    const currentPath = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : pathname ?? "/";
    const target = returnUrl ?? currentPath;
    const base: AddressDraft = draft ?? { startedAt: Date.now() };
    const next: AddressDraft = { ...base, returnUrl: target };
    setDraftState(next);
    setDraft(next);
    setDraftReady(true);
    router.push(`/address/pick?returnUrl=${encodeURIComponent(target)}`);
  };

  const setDraftGeo = (geo: GeoPoint, returnUrl?: string) => {
    const base: AddressDraft = draft ?? { startedAt: Date.now() };
    const next: AddressDraft = {
      ...base,
      geo,
      returnUrl: returnUrl ?? draft?.returnUrl,
    };
    setDraftState(next);
    setDraft(next);
    setDraftReady(true);
  };

  const saveDraftAsActiveAddress = (input: SaveDraftInput): Address | null => {
    if (!draft?.geo) return null;
    const now = Date.now();
    const base: Omit<Address, "display"> = {
      id: crypto.randomUUID ? crypto.randomUUID() : `addr-${now}-${Math.random().toString(16).slice(2, 8)}`,
      label: input.label ?? draft.label ?? "home",
      isDefault: true,
      geo: draft.geo,
      admin: input.admin,
      details: input.details,
      place: input.place,
      createdAt: draft.startedAt ?? now,
      updatedAt: now,
    };
    const display = buildAddressDisplay(base);
    const address: Address = { ...base, display };
    setActiveAddressState(address);
    persistActiveAddress(address);
    setDraftState(null);
    clearDraft();
    return address;
  };

  const clearAddress = () => {
    setActiveAddressState(null);
    clearActiveAddress();
    setDraftState(null);
    clearDraft();
  };

  const value: LocationContextValue = {
    activeAddress,
    draft,
    draftReady,
    startAddressWizard,
    setDraftGeo,
    updateDraft,
    saveDraftAsActiveAddress,
    clearAddress,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
}
