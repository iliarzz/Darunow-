"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { tapScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type StepState = "completed" | "active" | "pending";

export type StepItem = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  state: StepState;
};

export function Stepper({ steps }: { steps: StepItem[] }) {
  return (
    <div className="relative">
      <div className="absolute right-4 top-6 h-[calc(100%-32px)] w-[2px] rounded-full bg-border" />
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = step.state === "completed";
          const isActive = step.state === "active";
          return (
            <motion.div
              key={step.title}
              className="relative flex items-start gap-3 pr-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              {...tapScale}
            >
              <div
                className={cn(
                  "mt-1 grid h-8 w-8 place-items-center rounded-full border text-xs",
                  isDone && "border-primary-700 bg-primary-700 text-surface-1",
                  isActive && !isDone && "border-primary-700 bg-surface-1 text-primary-800",
                  !isDone && !isActive && "border-border bg-surface-2 text-muted",
                )}
              >
                {step.icon ?? (isDone ? <Check className="h-4 w-4" /> : idx + 1)}
              </div>
              <div className="space-y-1">
                <p className={cn("text-[14px] font-semibold", isActive || isDone ? "text-primary-900" : "text-muted")}>
                  {step.title}
                </p>
                {step.description && <p className="text-xs text-muted">{step.description}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
