"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { InsuranceInfo, InsuranceProvider, ProfileInfo } from "@/lib/types";

type ProfileState = {
  profile: ProfileInfo;
  updateProfile: (data: Partial<ProfileInfo>) => void;
  updateInsurance: (data: InsuranceInfo) => void;
  clearInsurance: () => void;
  toggleNotifications: (value: boolean) => void;
  reset: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: {
        fullName: "کاربر دارونَو",
        phone: "۰۹۱۲۱۲۳۴۵۶۷",
        notifications: true,
      },
      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),
      updateInsurance: (data) =>
        set((state) => ({
          profile: { ...state.profile, insurance: data },
        })),
      clearInsurance: () =>
        set((state) => ({
          profile: { ...state.profile, insurance: undefined },
        })),
      toggleNotifications: (value) =>
        set((state) => ({
          profile: { ...state.profile, notifications: value },
        })),
      reset: () =>
        set({
          profile: {
            fullName: "کاربر دارونَو",
            phone: "۰۹۱۲۱۲۳۴۵۶۷",
            notifications: true,
          },
        }),
    }),
    {
      name: "darunow-profile",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
