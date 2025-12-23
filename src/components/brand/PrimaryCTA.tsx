"use client";

import { motion } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrimaryCTA({ children, className, ...props }: ButtonProps) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className={cn("inline-block", className)}>
      <Button variant="brand" {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
