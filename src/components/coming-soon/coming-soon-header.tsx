"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type ComingSoonHeaderProps = {
  navItems?: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
  compactOnScroll?: boolean;
};

const defaultNavItems: NavItem[] = [
  { href: "/coming-soon/pharmacies", label: "برای داروخانه‌ها" },
  { href: "/coming-soon/clinics", label: "برای کلینیک‌ها" },
  { href: "/coming-soon/hospitals", label: "برای بیمارستان‌ها" },
  { href: "/coming-soon/vision", label: "چشم‌انداز" },
];

export function ComingSoonHeader({
  navItems = defaultNavItems,
  ctaHref = "/coming-soon#waitlist",
  ctaLabel = "عضویت",
  className,
  compactOnScroll = true,
}: ComingSoonHeaderProps) {
  const [compact, setCompact] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const menuId = useId();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
    } else {
      media.addListener(update);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    if (!compactOnScroll || isDesktop) {
      setCompact(false);
      return;
    }
    let frame = 0;
    const updateCompact = () => {
      const next = window.scrollY > 24;
      setCompact((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateCompact();
      });
    };
    updateCompact();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [compactOnScroll, isDesktop]);

  useEffect(() => {
    if (isDesktop) {
      setMenuOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky z-30 mx-auto w-full max-w-7xl px-6 transition-all duration-300",
          compact ? "top-1 pt-2" : "top-2 pt-4",
          className
        )}
      >
        <div
          className={cn(
            "relative rounded-[26px] bg-gradient-to-r from-white/20 via-white/5 to-white/20 p-[1px] transition-all duration-300",
            compact ? "shadow-[0_18px_80px_rgba(0,0,0,0.45)]" : "shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-[25px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-5 backdrop-blur-2xl transition-all duration-300",
              compact ? "py-2" : "py-3"
            )}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
              <div className="absolute -top-16 right-8 h-28 w-28 rounded-full bg-[#7EB3CC]/20 blur-3xl" />
              <div className="absolute -bottom-16 left-8 h-24 w-32 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                <div className="flex items-center justify-between gap-3 md:justify-start">
                  <Link
                    href="/coming-soon"
                    className="relative z-10 flex items-center gap-3 transition hover:opacity-90"
                    aria-label="بازگشت به صفحه به‌زودی دارونَو"
                  >
                    <div className={cn("relative", compact ? "h-9 w-9" : "h-10 w-10")}>
                      <Image
                        src="/brand/Darunow_1_logo.png"
                        alt="دارونَو"
                        fill
                        sizes="40px"
                        className="object-contain drop-shadow-[0_16px_46px_rgba(34,211,238,0.2)]"
                        priority
                      />
                    </div>
                    <div className="leading-tight">
                      <div className={cn("font-semibold tracking-wide", compact ? "text-[13px]" : "text-sm")}>
                        دارونَو
                      </div>
                      <div className={cn("text-white/60", compact ? "text-[11px]" : "text-xs")}>
                        سلامت دیجیتال — همکاران
                      </div>
                    </div>
                  </Link>
                <div className="flex items-center gap-2 md:hidden">
                    <MenuButton compact={compact} open={menuOpen} controls={menuId} onClick={() => setMenuOpen((v) => !v)} />
                </div>
                </div>

                <div className="hidden h-6 w-px bg-white/10 md:block" />

                <nav
                  className={cn(
                    "hidden items-center gap-2 text-white/70 md:flex md:flex-wrap",
                    compact ? "text-[11px]" : "text-xs"
                  )}
                  aria-label="بخش‌ها"
                >
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:border-white/30 hover:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

            <Link
              href={ctaHref}
              className={cn(
                "hidden items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 md:inline-flex",
                compact ? "py-1.5" : "py-2"
              )}
            >
              {ctaLabel}
              <ArrowLeft className="h-3.5 w-3.5 text-white/40" />
            </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && !isDesktop && (
          <>
            <motion.div
              key="menu-overlay"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              key="menu-panel"
              id={menuId}
              role="dialog"
              aria-modal="true"
              className="fixed right-4 top-20 z-50 w-[min(84vw,320px)] rounded-[28px] border border-white/15 bg-[#0A0F1B]/95 p-4 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
              initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">بخش‌ها</div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10"
                >
                  بستن
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link
                href={ctaHref}
                onClick={() => setMenuOpen(false)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:translate-y-[-1px]"
              >
                {ctaLabel}
                <ArrowLeft className="h-4 w-4 text-black/50" />
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuButton({
  compact,
  open,
  onClick,
  controls,
}: {
  compact: boolean;
  open: boolean;
  onClick: () => void;
  controls: string;
}) {
  const lineLong = compact ? "w-[18px]" : "w-5";
  const lineMid = compact ? "w-[14px]" : "w-4";
  const lineShort = compact ? "w-[10px]" : "w-3";
  return (
    <button
      type="button"
      className={cn(
        "group inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-3 transition hover:border-white/30 hover:bg-white/10",
        compact ? "py-1.5" : "py-2"
      )}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      aria-label="باز کردن منو"
      title="منو"
    >
      <span className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "h-px origin-right bg-white/70 transition-all duration-300",
            open ? lineLong : lineShort,
            open ? "translate-y-[5px] rotate-45" : "rotate-0"
          )}
        />
        <span
          className={cn(
            "h-px origin-right bg-white/70 transition-all duration-300",
            open ? lineLong : lineMid,
            open ? "opacity-0" : "opacity-100"
          )}
        />
        <span
          className={cn(
            "h-px origin-right bg-white/70 transition-all duration-300",
            open ? lineLong : lineLong,
            open ? "-translate-y-[5px] -rotate-45" : "rotate-0"
          )}
        />
      </span>
    </button>
  );
}
