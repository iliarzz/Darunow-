"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  details?: string;
  className?: string;
};

export function ErrorState({
  title = "مشکلی پیش اومد.",
  description = "دوباره تلاش کنیم؟",
  onRetry,
  details,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={cn("flex flex-col gap-2 rounded-[16px] border border-[#f0c8c8] bg-[#fdf5f5] p-5 text-[#912b2b]", className)}>
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <h3 className="text-[15px] font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-[#a34c4c]">{description}</p>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            تلاش دوباره
          </Button>
        )}
        {details && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-[#7b3c3c] underline-offset-4 hover:underline"
            onClick={() => setShowDetails((v) => !v)}
          >
            جزئیات
            <ChevronDown className={cn("h-4 w-4 transition", showDetails && "rotate-180")} />
          </button>
        )}
      </div>
      {showDetails && details && <p className="rounded-[12px] bg-white/70 p-3 text-xs text-[#6b2f2f]">{details}</p>}
    </div>
  );
}
