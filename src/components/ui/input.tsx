"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex min-h-[44px] w-full rounded-full border border-border bg-surface-1 px-4 text-sm text-primary-900 transition focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[var(--focus)] placeholder:text-muted disabled:bg-surface-3",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
