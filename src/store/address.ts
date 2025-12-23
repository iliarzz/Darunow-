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
  addAddress: (input: Omit<Address, "id" | "createdAt" | "updatedAt">) => Address;
  updateAddress: (id: string, data: Partial<Omit<Address, "id" | "createdAt">>) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id?: string) => void;
  setDefault: (id: string) => void;
};

export function useAddressStore<T>(selector: (state: AddressState) => T): T {
  const addresses = useAddresses();
  const current = useAddress();

  const state: AddressState = {
    addresses,
    selectedAddressId: current?.id,
    addAddress: (input) => createAddress(input),
    updateAddress: (id, data) => {
      updateAddress(id, data);
    },
    removeAddress: (id) => removeAddress(id),
    selectAddress: (id) => {
      if (id) setDefaultAddress(id);
    },
    setDefault: (id) => setDefaultAddress(id),
  };

  return selector(state);
}
