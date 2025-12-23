"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-primary-700 text-surface-1 border border-primary-700/80 hover:bg-primary-800",
        secondary: "bg-surface-2 text-primary-800 border border-border hover:border-primary-700/40",
        ghost: "bg-transparent text-primary-800 hover:bg-accent-200/30 border border-transparent",
        destructive: "bg-[#d64545] text-white border border-[#d64545] hover:bg-[#c13d3d]",
        outline: "bg-transparent text-primary-800 border border-border hover:border-primary-700/60",
        brand: "bg-primary-700 text-surface-1 border border-primary-700/80 hover:bg-primary-800",
        brandGhost: "bg-surface-2 text-primary-800 border border-accent-200/80 hover:bg-accent-200/40",
        subtle: "bg-surface-1 text-primary-800 border border-border",
      },
      size: {
        sm: "min-h-[40px] px-3 text-sm",
        md: "min-h-[44px] px-4 text-[15px]",
        lg: "min-h-[48px] px-5 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonBaseProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    icon?: React.ReactNode;
    iconAfter?: React.ReactNode;
    loading?: boolean;
  };

export type ButtonProps = ButtonBaseProps;

const MotionButton = motion.button as any;

export const Button = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ className, variant, size, asChild = false, icon, iconAfter, loading, children, ...props }, ref) => {
    const content = (
      <>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon ? <span className="grid h-5 w-5 place-items-center">{icon}</span> : null}
        <span className="whitespace-nowrap">{children}</span>
        {iconAfter ? <span className="grid h-5 w-5 place-items-center">{iconAfter}</span> : null}
      </>
    );

    if (asChild) {
      return (
        <Slot ref={ref as any} className={cn(buttonVariants({ variant, size, className }))} {...props} data-loading={loading}>
          {content}
        </Slot>
      );
    }

    return (
      <MotionButton
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={loading || props.disabled}
        {...tapScale}
        {...props}
      >
        {content}
      </MotionButton>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
