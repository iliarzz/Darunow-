import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TrustStrip } from "@/components/coming-soon/trust-strip";
import { WaitlistCard } from "./waitlist-card";

export const metadata: Metadata = {
  title: "دارونَو — به‌زودی",
  description: "دارونَو به‌زودی راه‌اندازی می‌شود. عضویت در لیست انتظار.",
};

const previewRows = [
  { title: "آدرس فعال", value: "به‌زودی…" },
  { title: "وضعیت‌ها", value: "به‌روز" },
  { title: "سفارش‌ها", value: "0" },
  { title: "یادآورها", value: "0" },
  { title: "اعلان‌ها", value: "0" },
];

const featureChips = ["پروفایل بیمار", "پرداخت امن", "پیگیری سفارش", "تیکت پشتیبانی"];

export default function ComingSoonPage() {
  return (
    <>
      <section className="relative cs-section mx-auto min-h-[90vh] max-w-7xl px-6">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">

        </div>
        <Parallax
          distance={30}
          className="relative z-10 flex min-h-[82vh] flex-col items-center justify-center gap-6 text-center"
        >
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7EB3CC] shadow-[0_0_18px_rgba(126,179,204,0.9)]" />
              در حال آماده‌سازی برای انتشار
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h1 className="cs-title text-balance text-[clamp(2.6rem,6vw,4.6rem)] font-semibold">
              دارونَو — تجربۀ داروخانۀ دیجیتال
              <span className="mt-4 block bg-gradient-to-l from-[#7EB3CC] via-white to-white bg-clip-text text-transparent">
                سفارش سریع، پیگیری دقیق، پشتیبانی واقعی.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="cs-body max-w-2xl text-white/70 md:text-lg">
              دارونَو به‌زودی راه‌اندازی می‌شود. برای دریافت دعوت بتا، ایمیل‌تان را ثبت کنید.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#waitlist"
                className="group inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition will-change-transform hover:translate-y-[-1px] active:translate-y-0"
              >
                عضویت در لیست انتظار
                <ArrowLeft className="mr-2 h-4 w-4 text-black/55 transition group-hover:-translate-x-0.5" />
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/8"
              >
                بازگشت به وب‌اپ
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="text-xs text-white/45">بدون اسپم — فقط اطلاع‌رسانی انتشار و دعوت بتا.</div>
          </ScrollReveal>
        </Parallax>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <ScrollReveal>
          <TrustStrip />
        </ScrollReveal>
      </section>

      <section className="cs-section mx-auto flex min-h-[72vh] max-w-6xl items-center px-6">
        <ScrollReveal>
          <div className="rounded-[32px] border border-white/12 bg-white/5 px-6 py-10 text-center backdrop-blur-xl md:px-10">
            <div className="text-xs text-white/45">سه اصل تجربۀ دارونَو</div>
            <h2 className="mt-4 text-3xl font-semibold text-white/90 md:text-4xl">
              سریع، شفاف، قابل اعتماد.
            </h2>
            <p className="mt-3 text-sm text-white/60 md:text-base">
              همه‌چیز کوتاه و بی‌اصطکاک؛ دقیقاً همان حسی که از محصولات ممتاز انتظار دارید.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section className="cs-section mx-auto flex min-h-[86vh] max-w-7xl items-center px-6">
        <ScrollReveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-5">
              <div className="text-xs text-white/45">پیش‌نمایش نسخه وب</div>
              <h2 className="text-2xl font-semibold md:text-3xl">همه‌چیز شفاف، سریع و یکپارچه</h2>
              <p className="cs-body text-white/70 md:text-base">
                مسیر سفارش تا تحویل در یک تجربۀ آرام و دقیق جمع می‌شود — مثل بهترین محصولات پریمیوم.
              </p>
              <div className="flex flex-wrap gap-2">
                {featureChips.map((chip) => (
                  <Chip key={chip}>{chip}</Chip>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Parallax
                distance={24}
                className="rounded-[38px] bg-gradient-to-br from-white/20 via-white/5 to-transparent p-[1px]"
              >
                <div className="relative rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_40px_140px_rgba(0,0,0,0.6)]">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">

                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">پیش‌نمایش تجربه</div>
                    <span className="rounded-full bg-[#7EB3CC]/15 px-3 py-1 text-xs text-[#D6F0FF] ring-1 ring-[#7EB3CC]/20">
                      نسخه وب
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {previewRows.map((row) => (
                      <PreviewRow key={row.title} title={row.title} value={row.value} />
                    ))}
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
                    <div className="text-xs text-white/55">وضعیت فعلی</div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.9)]" />
                      <span className="font-semibold">در حال توسعه</span>
                      <span className="text-xs text-white/45">• نزدیک به انتشار</span>
                    </div>
                  </div>

                  <Link href="/coming-soon" className="mt-6 inline-flex items-center gap-3 transition hover:opacity-90">
                    <div className="relative h-12 w-12 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                      <Image
                        src="/brand/Darunow_1_logo.png"
                        alt="دارونَو"
                        fill
                        sizes="48px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">دارونَو</div>
                      <div className="text-xs text-white/60">ساخته شده برای لحظه‌هایی که زمان مهم است.</div>
                    </div>
                  </Link>
                </div>
              </Parallax>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="waitlist" className="cs-section mx-auto flex min-h-[72vh] max-w-4xl items-center px-6">
        <ScrollReveal>
          <WaitlistCard />
        </ScrollReveal>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-10 text-center text-xs text-white/45">
        © {new Date().getFullYear()} دارونَو. کلیه حقوق محفوظ است.
      </footer>
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
      {children}
    </span>
  );
}

function PreviewRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-sm text-white/70">{title}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
