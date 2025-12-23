"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { MotionBackground } from "@/components/brand/motion-background";

const transition = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8,
};

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background pb-20 md:pb-0">
      <MotionBackground />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition }}
          exit={{ opacity: 0, y: -10, transition: { ...transition, duration: 0.2 } }}
          className="relative z-10"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
