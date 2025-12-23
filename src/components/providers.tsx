"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { ConfirmProvider } from "@/components/confirm/ConfirmProvider";
import { migrateStorage } from "@/lib/migrate";
import { syncOrdersFromServer } from "@/stores/orders";
import { syncFavoritesFromServer } from "@/stores/favorites";
import { syncRatingsFromServer } from "@/stores/ratings";
import { syncTicketsFromServer } from "@/stores/tickets";
import { syncAddressesFromServer } from "@/stores/address";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateStorage();
    void syncOrdersFromServer();
    void syncFavoritesFromServer();
    void syncRatingsFromServer();
    void syncTicketsFromServer();
    void syncAddressesFromServer();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ConfirmProvider>
        {children}
        <Toaster />
      </ConfirmProvider>
    </ThemeProvider>
  );
}
