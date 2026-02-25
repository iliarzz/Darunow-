"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { WaitlistForm } from "./waitlist-form";

export function WaitlistCard() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const contentId = useId();

  return (
    <motion.div
      layout
      className={cn(
        "group relative overflow-hidden rounded-[32px] border bg-white/5 p-6 text-center backdrop-blur-xl md:p-10",
        open ? "border-white/25 shadow-[0_30px_120px_rgba(0,0,0,0.5)]" : "border-white/12"
      )}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-1/3 h-40 w-40 rounded-full bg-[#7EB3CC]/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-40 w-52 rounded-full bg-white/10 blur-3xl" />

      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((prev) => !prev)}
        className="relative mx-auto flex w-full max-w-2xl cursor-pointer flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A0F]"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7EB3CC] shadow-[0_0_16px_rgba(126,179,204,0.9)]" />
          خوش آمدید
        </span>
        <div className="mt-3 flex w-full items-center justify-center gap-3">
          <h2 className="text-xl font-semibold md:text-2xl">دعوت به بتا خصوصی</h2>
          <span
            className={cn(
              "text-xl font-light text-white/50 transition duration-300",
              open ? "rotate-45 text-white/75" : "rotate-0"
            )}
            aria-hidden="true"
          >
            +
          </span>
        </div>
        <p className="mt-3 text-sm text-white/65 md:text-base">
          خوشحال می‌شویم از اولین کاربران باشید. ایمیل‌تان را وارد کنید تا هنگام آماده شدن، اولین نفرها مطلع شوید.
        </p>
        <span
          className={cn(
            "cs-hover-smooth mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition",
            open
              ? "border-white/10 bg-white/5 text-white/70"
              : "border-[#7EB3CC]/40 bg-gradient-to-l from-[#7EB3CC] via-[#A6D5E8] to-[#CBEAF6] text-[#050913] shadow-[0_18px_60px_rgba(126,179,204,0.35)]"
          )}
        >
          {!open && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#050913] shadow-[0_0_10px_rgba(5,9,19,0.45)] animate-[pulse_3s_ease-in-out_infinite]" />
          )}
          {open ? "بستن فرم" : "برای ثبت ایمیل کلیک کنید"}
          <ArrowLeft
            className={cn(
              "h-3.5 w-3.5 transition",
              open
                ? "rotate-180 text-white/40"
                : "translate-x-[2px] text-[#050913]/60 group-hover:translate-x-[4px]"
            )}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            key="waitlist-form"
            initial={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative overflow-hidden"
          >
            <WaitlistForm className="mx-auto mt-6 max-w-md" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
