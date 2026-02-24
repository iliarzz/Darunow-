import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SuccessMark } from "../../registered/success-mark";

export const metadata: Metadata = {
  title: "دارونَو — ثبت درخواست همکاری",
  description: "درخواست همکاری بیمارستان شما با موفقیت ثبت شد.",
};

export default function HospitalRegisterSuccessPage() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-4xl items-center px-6 pb-24 pt-10">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/5 p-8 text-center backdrop-blur-xl md:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-1/3 h-44 w-44 rounded-full bg-[#7EB3CC]/18 blur-3xl" />
            <div className="absolute -bottom-28 left-1/4 h-44 w-60 rounded-full bg-white/10 blur-3xl" />

          </div>

          <div className="relative space-y-4">
            <SuccessMark />
            <div className="text-xs text-white/55">ثبت موفق</div>
            <h1 className="text-balance text-2xl font-semibold md:text-3xl">
              درخواست همکاری بیمارستان شما با موفقیت ثبت شد.
            </h1>
            <p className="text-sm leading-7 text-white/65 md:text-base">
              تیم دارونَو به زودی جهت تکمیل مراحل با شما تماس می‌گیرد. از اعتماد شما سپاسگزاریم.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/coming-soon/hospitals"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                بازگشت به فرم
              </Link>
              <Link
                href="/coming-soon"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px]"
              >
                بازگشت به دارونَو
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
