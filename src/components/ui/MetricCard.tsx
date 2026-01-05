"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  className?: string;
};

export function MetricCard({ label, value, helper, icon, className }: Props) {
  return (
    <Card className={cn("flex items-center justify-between rounded-2xl border border-divider bg-surface-1/90 px-4 py-3 shadow-soft", className)}>
      <div className="space-y-[2px]">
        <p className="text-[12px] text-muted">{label}</p>
        <p className="text-xl font-bold text-primary-900 ltr">{value}</p>
        {helper && <p className="text-[12px] text-muted">{helper}</p>}
      </div>
      {icon && <div className="text-brand">{icon}</div>}
    </Card>
  );
}
