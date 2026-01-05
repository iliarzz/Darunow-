"use client";

import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "@/components/location/LocationProvider";

export function TopLocationBar({ className }: { className?: string }) {
  const { activeAddress, startAddressWizard } = useLocation();
  const pathname = usePathname();

  const subtitle = activeAddress?.display.subtitle || activeAddress?.display.formatted || "";
  const headline = activeAddress ? `ارسال به: ${subtitle || activeAddress.display.title}` : "موقعیت را مشخص کن";
  const cta = activeAddress ? "تغییر" : "انتخاب";

  const goToPicker = () => {
    const returnUrl = pathname || "/";
    startAddressWizard(returnUrl);
  };

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-[16px] border border-divider bg-surface-1 px-4 py-3 text-start shadow-xs",
        "transition hover:border-primary-700/40 focus-visible:outline-none focus-visible:shadow-[var(--focus)]",
        className,
      )}
      onClick={goToPicker}
      aria-label="تغییر موقعیت"
    >
      <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-200/60 text-primary-800">
        <MapPin className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-primary-900 line-clamp-1">{headline}</p>
        <p className="text-[12px] text-muted line-clamp-1">
          {activeAddress ? subtitle : "برای نمایش نزدیک‌ترین گزینه‌ها، موقعیت را انتخاب کن."}
        </p>
      </div>
      <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-primary-800">
        {cta}
      </span>
    </button>
  );
}
