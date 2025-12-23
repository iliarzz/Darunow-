"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  withText?: boolean;
  className?: string;
}

export function LogoMark({ withText = false, className }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.img
        src="/Image 2.PNG"
        alt="Darunow Logo"
        className="h-10 w-10 rounded-2xl border border-brand/20"
        initial={{ rotate: -2, opacity: 0.95 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      />
      {withText && (
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-[0.14em] text-muted">دارونَو</p>
          <p className="text-base font-semibold text-text">سلامت دیجیتال</p>
        </div>
      )}
    </div>
  );
}
