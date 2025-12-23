import { cn } from "@/lib/utils";

export function BrandGradientBorder({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative rounded-2xl p-[1px] shadow-brand", className)}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand/40 via-brand2/30 to-brand/40 opacity-80 blur" />
      <div className="relative rounded-2xl bg-background/80 backdrop-blur-xl">{children}</div>
    </div>
  );
}
