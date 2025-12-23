"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  featured?: boolean;
}

const MotionDiv = motion.div as any;

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, interactive, featured, ...props }, ref) => {
  const Comp = interactive ? MotionDiv : "div";
  const tapProps = interactive ? tapScale : {};

  return (
    <Comp
      ref={ref as any}
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-divider bg-surface-1 shadow-elev-1 transition-shadow duration-150",
        interactive ? "hover:shadow-elev-2" : "shadow-elev-1",
        featured
          ? "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-l before:from-accent-500/60 before:to-primary-800/70"
          : "",
        className,
      )}
      {...tapProps}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-2 p-5", className)} {...props} />,
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn("text-[16px] font-semibold leading-tight", className)} {...props} />,
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-muted", className)} {...props} />,
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />,
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
