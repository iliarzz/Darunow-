"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MotionBackground({ subtle = false }: { subtle?: boolean }) {
  const base = "pointer-events-none fixed inset-0 -z-10 overflow-hidden";

  return (
    <div className={base}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,102,255,0.05),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(10,200,255,0.04),transparent_28%)]" />
      <motion.div
        className="absolute left-[-20%] top-10 h-[160%] w-[40%] -rotate-12 bg-gradient-to-br from-brand/4 via-brand2/6 to-transparent blur-3xl"
        animate={{ x: [0, 30, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-15%] top-0 h-[140%] w-[38%] rotate-6 bg-gradient-to-b from-brand2/6 via-brand/8 to-transparent blur-3xl"
        animate={{ x: [0, -24, 12, 0], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      {!subtle && (
        <motion.div
          className={cn(
            "absolute inset-x-8 top-1/3 h-32 rounded-[24px] border border-white/5",
            "bg-[linear-gradient(115deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_55%)]",
            "backdrop-blur-lg"
          )}
          animate={{ x: [0, 10, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
