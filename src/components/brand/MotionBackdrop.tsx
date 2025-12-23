"use client";

import { motion } from "framer-motion";
import { SpeedLines } from "@/components/brand/SpeedLines";
import { cn } from "@/lib/utils";

export function MotionBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden opacity-60", className)}>
      <motion.div
        className="absolute -left-24 top-10 h-48 w-48 rotate-12"
        animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <SpeedLines className="h-16 w-28 text-brand/8 blur-sm" />
      </motion.div>
      <motion.div
        className="absolute right-0 bottom-10 h-48 w-48 -rotate-6"
        animate={{ x: [0, -10, 0], y: [0, 6, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        <SpeedLines className="h-20 w-32 text-brand/8 blur-[1px]" />
      </motion.div>
    </div>
  );
}
