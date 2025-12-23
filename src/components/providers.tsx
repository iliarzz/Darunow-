"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { ConfirmProvider } from "@/components/confirm/ConfirmProvider";
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
      <ConfirmProvider>
        {children}
        <Toaster />
      </ConfirmProvider>
    </ThemeProvider>
  );
}
