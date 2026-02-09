"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { ConfirmProvider } from "@/components/confirm/ConfirmProvider";
import { LocationProvider } from "@/components/location/LocationProvider";
import { migrateStorage } from "@/lib/migrate";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateStorage();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <LocationProvider>
        <ConfirmProvider>
          {children}
          <Toaster />
        </ConfirmProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}
