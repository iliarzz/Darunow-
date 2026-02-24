import type { Metadata } from "next";
import { Parallax } from "@/components/motion/parallax";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ScrollSnap } from "@/components/motion/scroll-snap";
import { StickyPartnerCta } from "@/components/coming-soon/sticky-partner-cta";
import { TrustStrip } from "@/components/coming-soon/trust-strip";
import { PharmacyRegistrationCard } from "./registration-form";

export const metadata: Metadata = {
  title: "دارونَو — ثبت همکاری داروخانه‌ها",
  description: "داروخانه خود را در دارونَو ثبت کنید و به شبکه همکاری بپیوندید.",
};

const quickStats = [
  { label: "ثبت اولیه", value: "۵ دقیقه" },
  { label: "پاسخ‌گویی", value: "۲۴ ساعت کاری" },
  { label: "فعال‌سازی", value: "مرحله‌ای" },
];

const benefits = [
  {
    title: "سفارش‌های نزدیک و هدفمند",
    description: "الگوریتم دارونَو سفارش‌ها را بر اساس موقعیت و ظرفیت شما انتخاب می‌کند.",
  },
  {
    title: "تسویه و گزارش شفاف",
    description: "وضعیت سفارش‌ها، پرداخت‌ها و گزارش‌ها همیشه روشن و قابل پیگیری است.",
  },
  {
    title: "پشتیبانی اختصاصی",
    description: "تیم دارونَو برای هماهنگی و حل مسائل در کنار شماست.",
  },
];

const steps = [
  {
    title: "ثبت اطلاعات پایه",
    description: "فرم کوتاه را تکمیل کنید تا اطلاعات اولیه داروخانه ثبت شود.",
  },
  {
    title: "اعتبارسنجی و هماهنگی",
    description: "اطلاعات بررسی می‌شود و برای هماهنگی نهایی با شما تماس می‌گیریم.",
  },
  {
    title: "فعال‌سازی و شروع",
    description: "پس از تأیید، پنل فعال می‌شود و سفارش‌ها برای شما ارسال خواهد شد.",
  },
];

const previewRows = [
  { title: "سفارش‌های نزدیک", value: "هوشمند" },
  { title: "تسویه‌ها", value: "شفاف" },
  { title: "پشتیبانی", value: "اختصاصی" },
  { title: "گزارش‌ها", value: "روزانه" },
];

const miniStats = [
  { label: "زمان پاسخ", value: "کمتر از ۲۴ ساعت" },
  { label: "فعال‌سازی", value: "۳ تا ۵ روز" },
];

const registerNotes = [
  "مدارک قانونی در مرحله بعدی دریافت می‌شود.",
  "هماهنگی سریع برای تعیین شرایط همکاری.",
  "آموزش کوتاه و شروع رسمی فعالیت.",
];

const snapSection = "snap-start snap-always";

export default function PharmacyRegisterPage() {
  return (
    <>
      <ScrollSnap paddingTop={72} />

      <section className={`relative cs-section mx-auto min-h-[92vh] max-w-7xl px-6 ${snapSection}`}>
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">

        </div>

        <div className="relative grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 text-center md:text-right lg:col-span-6">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7EB3CC] shadow-[0_0_16px_rgba(126,179,204,0.9)]" />
                برای داروخانه‌ها
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h1 className="cs-title text-balance text-[clamp(2.2rem,5vw,3.6rem)] font-semibold">
                داروخانه شما، در شبکه دارونَو
                <span className="mt-3 block bg-gradient-to-l from-[#7EB3CC] via-white to-white bg-clip-text text-transparent">
                  سفارش‌های محلی، تسویه شفاف، پشتیبانی اختصاصی.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="cs-body text-white/70 md:text-base">
                ثبت اولیه بسیار کوتاه است. بعد از بررسی، پنل داروخانه شما فعال می‌شود و به شبکه منتخب دارونَو می‌پیوندید.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <a
                  href="#register"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px]"
                >
                  شروع ثبت درخواست همکاری
                </a>
                <a
                  href="#flow"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  مشاهده مسیر همکاری
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="grid gap-3 sm:grid-cols-3">
                {quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/70 backdrop-blur-xl md:text-right"
                  >
                    <div className="text-[11px] text-white/50">{stat.label}</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">{stat.value}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6">
            <ScrollReveal delay={0.12}>
              <Parallax distance={26} className="rounded-[38px] bg-gradient-to-br from-white/20 via-white/5 to-transparent p-[1px]">
                <div className="relative rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_40px_140px_rgba(0,0,0,0.6)]">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">

                  </div>
                  <div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row md:text-right">
                    <div className="text-sm font-semibold">پیش‌نمایش پنل داروخانه</div>
                    <span className="rounded-full bg-[#7EB3CC]/15 px-3 py-1 text-xs text-[#D6F0FF] ring-1 ring-[#7EB3CC]/20">
                      نسخه شبکه
                    </span>
                  </div>

                <div className="mt-5 space-y-3">
                  {previewRows.map((row) => (
                    <PreviewRow key={row.title} title={row.title} value={row.value} />
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4 text-center md:text-right">
                  <div className="text-xs text-white/55">وضعیت</div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm md:justify-start">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.9)]" />
                    <span className="font-semibold">در حال جذب داروخانه‌های منتخب</span>
                  </div>
                </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {miniStats.map((stat) => (
                      <MiniStat key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                  </div>
                </div>
              </Parallax>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <ScrollReveal>
          <TrustStrip />
        </ScrollReveal>
      </section>

      <section
        id="benefits"
        className={`cs-section mx-auto flex min-h-[78vh] max-w-6xl items-center px-6 ${snapSection}`}
      >
        <div className="w-full">
          <ScrollReveal>
            <div className="rounded-[32px] border border-white/12 bg-white/5 px-6 py-8 text-center backdrop-blur-xl md:px-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                چرا دارونَو؟
              </div>
              <h2 className="mt-4 text-balance text-3xl font-semibold text-white/90 md:text-4xl">
                داروخانه شما دیده می‌شود
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                سفارش‌ها دقیق، ارتباط شفاف و تجربۀ مشتری حرفه‌ای خواهد بود — بدون پیچیدگی اضافه.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={index * 0.08} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/25">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-16 right-6 h-24 w-24 rounded-full bg-[#7EB3CC]/20 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="relative">
                    <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-l from-[#7EB3CC] to-transparent" />
                    <div className="text-sm font-semibold text-white/90">{benefit.title}</div>
                    <div className="mt-2 text-sm leading-6 text-white/60">{benefit.description}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className={`cs-section mx-auto flex min-h-[78vh] max-w-6xl items-center px-6 ${snapSection}`}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <ScrollReveal className="lg:col-span-4">
            <div className="rounded-[28px] border border-white/12 bg-white/5 p-6 backdrop-blur-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                مسیر همکاری
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">از ثبت تا فعال‌سازی</h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                فرآیند کوتاه، واضح و مرحله‌ای طراحی شده تا سریع به نتیجه برسید.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative space-y-4 lg:col-span-8 lg:pr-8">
            <div className="pointer-events-none absolute inset-y-6 right-4 w-px bg-gradient-to-b from-white/35 via-white/10 to-transparent" />
            {steps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 0.08}>
                <div className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-white/5 p-5 backdrop-blur-xl transition duration-300 hover:border-white/25">
                  <span className="absolute right-3 top-7 h-2.5 w-2.5 rounded-full bg-[#7EB3CC] shadow-[0_0_12px_rgba(126,179,204,0.9)]" />
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-8 right-8 text-5xl font-semibold text-white/5">0{index + 1}</div>
                  </div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white/80">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/90">{step.title}</div>
                      <div className="mt-2 text-sm leading-6 text-white/60">{step.description}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="register"
        className={`cs-section mx-auto flex min-h-[90vh] max-w-6xl items-center px-6 ${snapSection}`}
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <ScrollReveal className="lg:col-span-5">
            <div className="rounded-[28px] border border-white/12 bg-white/5 p-6 backdrop-blur-xl md:p-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                ثبت درخواست همکاری
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">همین حالا شروع کنید</h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                اطلاعات پایه را وارد کنید. بعد از بررسی اولیه، تیم دارونَو برای هماهنگی نهایی با شما تماس می‌گیرد.
              </p>
              <div className="mt-6 space-y-3">
                {registerNotes.map((item) => (
                  <div
                    key={item}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-4 py-3 text-sm text-white/75 transition duration-300 hover:border-white/25"
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute -left-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#7EB3CC]/20 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />
                    </div>
                    <div className="relative flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#7EB3CC]" />
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-7">
            <PharmacyRegistrationCard />
          </ScrollReveal>
        </div>
      </section>
      <StickyPartnerCta href="#register" />
    </>
  );
}

function PreviewRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-between gap-1 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-center md:flex-row md:text-right">
      <div className="text-sm text-white/70">{title}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center md:text-right">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/85">{value}</div>
    </div>
  );
}
