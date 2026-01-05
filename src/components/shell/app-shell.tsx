"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { SpeedLineAccent } from "@/components/brand/SpeedLineAccent";
import { cn } from "@/lib/utils";
import { pageFade } from "@/lib/motion";
import { TopLocationBar } from "@/components/location/TopLocationBar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare =
    pathname?.startsWith("/ops") ||
    pathname?.startsWith("/coming-soon") ||
    pathname?.startsWith("/vision") ||
    pathname?.startsWith("/vission") ||
    pathname?.startsWith("/pharmacy") ||
    pathname?.startsWith("/pharmacy-panel") ||
    pathname?.startsWith("/pharmacy-portal") ||
    pathname?.startsWith("/doctor-portal");
  const showLocationBar = useMemo(
    () =>
      Boolean(
        pathname &&
          [
            "/",
            "/cart",
            "/orders",
            "/profile",
            "/prescriptions",
            "/prescriptions/new",
            "/search",
            "/categories",
            "/pharmacies",
            "/doctors",
            "/checkout",
          ].some((p) => pathname === p || pathname.startsWith(`${p}/`)),
      ),
    [pathname],
  );
  if (bare) {
    return <div className="min-h-screen bg-surface-2 text-primary-900">{children}</div>;
  }
  return (
    <div className="relative min-h-screen bg-surface-2 text-primary-900">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-32 pt-4">
        <TopBar />
        {showLocationBar && (
          <div className="mb-4">
            <TopLocationBar />
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.main key={pathname} className="flex-1 w-full" {...pageFade}>
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}

function TopBar() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handler = () => setCompact(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mb-5 border border-divider/80 bg-surface-1/90 px-4 py-3 backdrop-blur-md transition-all duration-200",
        "rounded-[18px]",
        compact ? "shadow-elev-1" : "shadow-none",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 transition-all duration-200",
          compact ? "h-12" : "h-14",
        )}
      >
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/Darunow_1_logo.png"
              alt="Darunow"
              width={64}
              height={64}
              className="h-14 w-14 rounded-xl object-contain [clip-path:inset(4%)]"
              priority
            />
          </Link>
          <div className="hidden min-[380px]:flex flex-1 items-center gap-2 rounded-[14px] border border-divider bg-surface-2 px-2 py-1 text-start text-xs text-muted">
            <SpeedLineAccent className="h-5 w-10 opacity-70" />
            <p className="truncate text-[13px] font-semibold text-primary-900">دارونَو · ارسال سریع و مطمئن</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="min-w-[44px] rounded-full px-3" title="جستجو">
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
