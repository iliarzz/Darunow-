"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { SpeedLineAccent } from "@/components/brand/SpeedLineAccent";
import { cn } from "@/lib/utils";
import { pageFade } from "@/lib/motion";
import { getCityName, getProvinceName } from "@/lib/location/iran";
import { AddressPickerSheet } from "@/components/features/AddressPickerSheet";
import { setDefaultAddress, useAddresses } from "@/stores/address";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="relative min-h-screen bg-surface-2 text-primary-900">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-4">
        <TopBar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main key={pathname} className="flex-1 w-full" {...pageFade}>
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}

function TopBar() {
  const addresses = useAddresses();
  const current = addresses.find((a) => a.isDefault) ?? addresses[0];
  const locationText = current
    ? `${current.label} · ${getCityName(current.city)}`
    : "آدرس را انتخاب کن";
  const areaText = current ? `${getProvinceName(current.province)}` : "موقعیت را مشخص کن";

  return (
    <header className="mb-5 rounded-[18px] border border-border bg-surface-1 px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-200/60 text-primary-800">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-muted">{areaText}</p>
            <p className="truncate text-[15px] font-semibold">{locationText}</p>
          </div>
          <SpeedLineAccent className="ml-auto h-5 w-10" />
        </div>
        <div className="flex items-center gap-2">
          <AddressPickerSheet
            selectedId={current?.id}
            onSelect={async (id) => {
              await setDefaultAddress(id);
            }}
          >
            <Button size="sm" variant="secondary">
              تغییر
            </Button>
          </AddressPickerSheet>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="min-w-[44px] px-3"
            title="جستجو"
          >
            <Link href={{ pathname: "/pharmacies", query: { focus: "search" } }}>
              <Search className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
