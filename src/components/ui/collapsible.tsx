import { createContext, ReactNode, useContext } from "react";
import { cn } from "@/lib/utils";

type CollapsibleContextValue = { open: boolean; onOpenChange?: (open: boolean) => void };

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function Collapsible({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  return <CollapsibleContext.Provider value={{ open, onOpenChange }}>{children}</CollapsibleContext.Provider>;
}

export function CollapsibleTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      className={cn("inline-flex items-center justify-center", className)}
      onClick={() => ctx.onOpenChange?.(!ctx.open)}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx?.open) return null;
  return <div className={className}>{children}</div>;
}
