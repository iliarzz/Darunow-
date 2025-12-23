"use client";

import { motion, type MotionProps } from "framer-motion";

type FadeSlideInProps = MotionProps & { children: React.ReactNode; delay?: number };

export function FadeSlideIn({ children, delay = 0, ...rest }: FadeSlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
