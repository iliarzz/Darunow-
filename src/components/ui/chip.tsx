"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  icon?: React.ReactNode;
};

const MotionButton = motion.button as any;

export function Chip({ className, selected, icon, children, ...props }: ChipProps) {
  return (
    <MotionButton
      type="button"
      className={cn(
        "inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        selected ? "border-primary-700 bg-primary-700 text-surface-1" : "border-border bg-surface-2 text-primary-800 hover:border-primary-700/50",
        className,
      )}
      {...tapScale}
      {...props}
    >
      {icon && <span className="grid h-4 w-4 place-items-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </MotionButton>
  );
}
