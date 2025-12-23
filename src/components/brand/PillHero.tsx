"use client";

import { motion } from "framer-motion";
import { SpeedLines } from "@/components/brand/SpeedLines";
import { cn } from "@/lib/utils";

export function PillHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-56 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand/12 via-white to-brand2/10", className)}>
      <motion.div
        className="absolute left-6 top-10 h-32 w-60 rounded-full bg-gradient-to-r from-brand to-brand2 blur-[1px] opacity-90"
        animate={{ y: [-6, 6, -6], rotate: [-1, 1, -1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-12 top-14 h-28 w-52 rounded-full bg-white/10"
        animate={{ x: [0, 6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <SpeedLines className="absolute right-6 top-10 h-10 w-20 text-brand/20" />
      <SpeedLines className="absolute right-3 bottom-6 h-8 w-16 text-brand2/16" />
    </div>
  );
}
