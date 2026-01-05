"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SuccessMark() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-l from-[#7EB3CC] via-[#A6D5E8] to-[#CBEAF6] shadow-[0_20px_60px_rgba(126,179,204,0.35)]"
      animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
      transition={reduceMotion ? undefined : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="34" height="26" viewBox="0 0 34 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M2.5 14.5L12.5 23L31.5 3"
          stroke="#050913"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
    </motion.div>
  );
}
