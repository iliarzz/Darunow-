"use client";

import type { Address } from "@/lib/types-v2";
import {
  createAddress,
  removeAddress,
  setDefaultAddress,
  updateAddress,
  useAddress,
  useAddresses,
} from "@/stores/address";

type AddressState = {
  addresses: Address[];
  selectedAddressId?: string;
  addAddress: (input: Omit<Address, "id" | "createdAt" | "updatedAt">) => Promise<Address>;
  updateAddress: (id: string, data: Partial<Omit<Address, "id" | "createdAt">>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  selectAddress: (id?: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
};

export function useAddressStore<T>(selector: (state: AddressState) => T): T {
  const addresses = useAddresses();
  const current = useAddress();

  const state: AddressState = {
    addresses,
    selectedAddressId: current?.id,
    addAddress: async (input) => createAddress(input),
    updateAddress: async (id, data) => {
      await updateAddress(id, data);
    },
    removeAddress: async (id) => removeAddress(id),
    selectAddress: async (id) => {
      if (id) await setDefaultAddress(id);
    },
    setDefault: async (id) => {
      await setDefaultAddress(id);
    },
  };

  return selector(state);
}
