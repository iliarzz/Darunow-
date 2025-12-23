"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors border",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface-2 text-primary-800",
        success: "border-transparent bg-[#e3f4ed] text-[#1b9a78]",
        info: "border-transparent bg-accent-200 text-primary-800",
        warning: "border-transparent bg-[#fdf3e1] text-[#b87624]",
        error: "border-transparent bg-[#f8e6e6] text-[#c13d3d]",
        outline: "border-border text-primary-800 bg-transparent",
        brand: "border-transparent bg-accent-200 text-primary-800",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
