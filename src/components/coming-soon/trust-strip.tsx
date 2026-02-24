import { cn } from "@/lib/utils";

export type TrustItem = {
  label: string;
  value: string;
};

type TrustStripProps = {
  items?: TrustItem[];
  className?: string;
};

const defaultItems: TrustItem[] = [
  { label: "زمان پاسخ", value: "کمتر از ۲۴ ساعت" },
  { label: "امنیت داده", value: "کنترل چندلایه" },
  { label: "پشتیبانی", value: "اختصاصی" },
];

export function TrustStrip({ items = defaultItems, className }: TrustStripProps) {
  return (
    <div className={cn("cs-card mx-auto w-full max-w-5xl px-4 py-3 md:px-5", className)}>
      <div className="grid gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-center md:text-right"
          >
            <div className="text-[11px] text-white/50">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-white/85">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
