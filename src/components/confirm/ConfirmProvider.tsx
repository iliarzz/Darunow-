"use client";

import { createContext, useContext, useState } from "react";
import { ConfirmDialog, type ConfirmOptions } from "@/components/confirm/ConfirmDialog";

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resolver?.(false);
    }
    setOpen(next);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog open={open} onOpenChange={handleOpenChange} options={options} onConfirm={handleConfirm} />
    </ConfirmContext.Provider>
  );
}

export function useConfirmContext() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
