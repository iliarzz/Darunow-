"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { type ComponentType, useMemo } from "react";
import { Home, Search, ShoppingBag, ClipboardList, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartCount } from "@/stores/cart";
import { tapScale } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";

type NavHref = string | { pathname: string; query?: Record<string, string> };
type NavItem = { href: NavHref; label: string; icon: ComponentType<{ className?: string }> };

const navItems: NavItem[] = [
  { href: "/", label: "خانه", icon: Home },
  { href: { pathname: "/pharmacies", query: { focus: "search" } }, label: "جستجو", icon: Search },
  { href: "/cart", label: "سبد", icon: ShoppingBag },
  { href: "/orders", label: "سفارش‌ها", icon: ClipboardList },
  { href: "/profile", label: "پروفایل", icon: User2 },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartCount();

  const activeHref = useMemo(() => pathname || "/", [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-divider bg-surface-1/95 px-2 py-2 shadow-elev-1 backdrop-blur">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hrefPath = typeof item.href === "string" ? item.href.split("?")[0] : item.href.pathname ?? "";
          const isActive = hrefPath === "/" ? activeHref === "/" : activeHref.startsWith(hrefPath);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-center"
            >
              <motion.div
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-[14px] px-2 py-2 text-[11px] font-semibold transition-colors",
                  isActive ? "bg-surface-3 text-primary-900 shadow-xs border border-divider" : "text-muted",
                )}
                {...tapScale}
              >
                <div className="relative grid h-9 w-9 place-items-center">
                  <Icon className="h-5 w-5" />
                  {(item.href === "/cart" || (typeof item.href !== "string" && item.href.pathname === "/cart")) && cartCount > 0 && (
                    <Badge variant="info" className="absolute -right-2 -top-1 rounded-full px-2 py-0 text-[10px] font-bold">
                      {formatNumber(cartCount)}
                    </Badge>
                  )}
                </div>
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
