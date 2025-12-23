"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 120 48"
      className={cn("h-10 w-auto text-brand", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ rotate: -2 }}
      animate={{ rotate: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
    >
      <defs>
        <linearGradient id="pillGradient" x1="0" y1="0" x2="120" y2="0">
          <stop stopColor="#0F2E6D" />
          <stop offset="1" stopColor="#2F7BFF" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="108" height="36" rx="18" fill="url(#pillGradient)" opacity="0.92" />
      <rect x="12" y="12" width="60" height="24" rx="12" fill="white" opacity="0.12" />
      <rect x="78" y="12" width="24" height="24" rx="12" fill="white" opacity="0.18" />
      <motion.g
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ x: -4 }}
        animate={{ x: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <line x1="20" y1="24" x2="48" y2="24" />
        <line x1="26" y1="18" x2="46" y2="18" />
        <line x1="26" y1="30" x2="46" y2="30" />
      </motion.g>
    </motion.svg>
  );
}
