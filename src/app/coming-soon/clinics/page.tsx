import type { Metadata } from "next";
import { Parallax } from "@/components/motion/parallax";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ClinicRegistrationCard } from "./registration-form";

export const metadata: Metadata = {
  title: "دارونَو — ثبت همکاری کلینیک‌ها",
  description: "کلینیک خود را در دارونَو ثبت کنید و به شبکه همکاری بپیوندید.",
};

const heroSignals = [
  { label: "نوبت امروز", value: "۱۲ نوبت" },
  { label: "میانگین انتظار", value: "۷ دقیقه" },
  { label: "نرخ رضایت", value: "۹۴٪" },
  { label: "پیگیری فعال", value: "۲۴ پرونده" },
];

const pulseRows = [
  { label: "هماهنگی تیم درمان", value: "فعال", percent: 84 },
  { label: "نسخه دیجیتال", value: "پایدار", percent: 72 },
  { label: "پیگیری پس از ویزیت", value: "هوشمند", percent: 66 },
];

const focusChips = ["هماهنگی نوبت‌ها", "پیگیری پس از ویزیت", "اطلاع‌رسانی به بیمار"];

type BenefitVisualVariant = "schedule" | "payments" | "notifications" | "profile";

const benefitItems: Array<{
  title: string;
  description: string;
  visual: BenefitVisualVariant;
}> = [
  {
    title: "نوبت‌دهی هوشمند",
    description: "تقویم ویزیت‌ها و تغییرات بدون اصطکاک هماهنگ می‌شود.",
    visual: "schedule",
  },
  {
    title: "پرداخت و گزارش",
    description: "نمای شفاف از پرداخت‌ها، تراکنش‌ها و گزارش عملکرد.",
    visual: "payments",
  },
  {
    title: "اطلاع‌رسانی زنده",
    description: "پیام‌های دقیق برای بیمار، منشی و پزشک.",
    visual: "notifications",
  },
  {
    title: "پروفایل بیمار",
    description: "تاریخچه درمان، نسخه‌ها و یادآوری‌ها در یک صفحه.",
    visual: "profile",
  },
];

const flowSteps = [
  {
    title: "ثبت اطلاعات اولیه",
    description: "نام کلینیک، مسئول، شهر و راه ارتباطی را ثبت کنید.",
  },
  {
    title: "بررسی و هماهنگی",
    description: "اطلاعات بررسی می‌شود و برای هماهنگی نهایی تماس می‌گیریم.",
  },
  {
    title: "فعال‌سازی و شروع",
    description: "پس از تأیید، پنل کلینیک فعال و آماده ارائه خدمات می‌شود.",
  },
];

const registerNotes = [
  "مدارک تکمیلی در مرحله بعدی دریافت می‌شود.",
  "هماهنگی سریع برای تعیین شرایط همکاری.",
  "آموزش کوتاه و شروع رسمی فعالیت.",
];

export default function ClinicRegisterPage() {
  return (
    <>
      <section className="relative mx-auto min-h-[88vh] max-w-7xl px-6 pb-20 pt-14">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">
          <div className="absolute left-1/4 top-10 h-40 w-64 rounded-full bg-[#7EB3CC]/18 blur-[120px]" />
          <div className="absolute right-1/4 top-24 h-52 w-52 rounded-full bg-white/10 blur-[140px]" />
          <div className="light-sweep absolute -inset-y-1/2 left-0 w-[180%] opacity-45" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7EB3CC] shadow-[0_0_16px_rgba(126,179,204,0.9)]" />
              برای کلینیک‌ها
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h1 className="mt-4 text-balance text-[clamp(2.6rem,6vw,4.2rem)] font-semibold leading-[1.18] tracking-normal">
              مدیریت کلینیک با ریتمی آرام و دقیق
              <span className="mt-3 block bg-gradient-to-l from-[#7EB3CC] via-white to-white bg-clip-text text-transparent">
                نوبت، نسخه، پیگیری — در یک جریان هماهنگ.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
              دارونَو برای کلینیک‌هایی طراحی شده که نظم، سرعت و تجربۀ بیمار برایشان اولویت است.
              ثبت اولیه کوتاه است و مسیر همکاری شفاف می‌ماند.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
            <div className="mt-10 w-full max-w-5xl rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {heroSignals.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                    <div className="text-[11px] text-white/45">{item.label}</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto flex min-h-[82vh] max-w-6xl items-center px-6 pb-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <ScrollReveal className="order-2 lg:order-1">
            <div className="space-y-4">
              <div className="text-xs text-white/45">اتاق فرمان کلینیک</div>
              <h2 className="text-2xl font-semibold md:text-3xl">همه‌چیز دقیق و قابل پیگیری</h2>
              <p className="text-sm leading-7 text-white/70 md:text-base">
                مسیر درمان، اطلاع‌رسانی و پیگیری در یک داشبورد آرام جمع می‌شود تا تیم درمان با تمرکز بیشتری کار کند.
              </p>
              <div className="flex flex-wrap gap-2">
                {focusChips.map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12} className="order-1 lg:order-2">
            <Parallax distance={24}>
              <div className="relative rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_40px_140px_rgba(0,0,0,0.6)]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[34px]">
                  <div className="light-sweep absolute -inset-y-1/2 left-0 w-[160%] opacity-35" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">تپش کلینیک</div>
                  <span className="rounded-full bg-[#7EB3CC]/15 px-3 py-1 text-xs text-[#D6F0FF] ring-1 ring-[#7EB3CC]/20">
                    زنده
                  </span>
                </div>

              <div className="mt-5 space-y-4">
                {pulseRows.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{row.label}</span>
                      <span className="text-white/60">{row.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="text-xs text-white/55">وضعیت</div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.9)]" />
                    <span className="font-semibold">در حال جذب کلینیک‌های منتخب</span>
                  </div>
                </div>
              </div>
            </Parallax>
          </ScrollReveal>
        </div>
      </section>

      <section id="benefits" className="mx-auto flex min-h-[92vh] max-w-6xl items-center px-6 pb-24">
        <div className="w-full space-y-8">
          <ScrollReveal>
            <div className="rounded-[32px] border border-white/12 bg-white/5 px-6 py-8 text-right backdrop-blur-xl md:px-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                چرا دارونَو؟
              </div>
              <h2 className="mt-4 text-balance text-2xl font-semibold text-white/90 md:text-3xl">
                تجربۀ هماهنگ برای تیم درمان
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                داده‌ها روشن، ارتباط‌ها یکپارچه و تصمیم‌گیری سریع‌تر خواهد شد.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {benefitItems.map((item, index) => (
              <div
                key={item.title}
                className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:[direction:ltr]"
              >
                <ScrollReveal delay={index * 0.06} className="h-full">
                  <BenefitVisual variant={item.visual} title={item.title} idSuffix={`benefit-${index}`} />
                </ScrollReveal>
                <ScrollReveal delay={index * 0.06 + 0.05} className="h-full">
                  <div className="group relative flex h-full flex-col justify-between rounded-[28px] border border-white/12 bg-white/5 p-6 text-right backdrop-blur-xl transition duration-300 hover:border-white/25 lg:[direction:rtl]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white/90">{item.title}</div>
                        <div className="mt-2 text-sm leading-7 text-white/60">{item.description}</div>
                      </div>
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white/80">
                        0{index + 1}
                      </div>
                    </div>
                    <div className="mt-5 h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />
                  </div>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="mx-auto flex min-h-[72vh] max-w-6xl items-center px-6 pb-24">
        <div className="w-full">
          <ScrollReveal>
            <div className="rounded-[28px] border border-white/12 bg-white/5 p-6 text-center backdrop-blur-xl md:p-7">
              <div className="text-xs text-white/45">مسیر همکاری</div>
              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">سه قدم ساده تا شروع</h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                مرحله‌ها شفاف‌اند و تیم دارونَو در هر قدم کنار شماست.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {flowSteps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 0.08} className="h-full">
                <div className="group relative flex h-full flex-col rounded-[28px] border border-white/12 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-white/25">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/50">مرحله {index + 1}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-white/75">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="mt-4 text-sm font-semibold text-white/90">{step.title}</div>
                  <div className="mt-2 text-sm leading-6 text-white/60">{step.description}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="mx-auto flex min-h-[88vh] max-w-6xl items-center px-6 pb-24">
        <div className="w-full">
          <ScrollReveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                ثبت درخواست همکاری
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">همین حالا شروع کنید</h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                اطلاعات پایه را وارد کنید. بعد از بررسی اولیه، تیم دارونَو برای هماهنگی نهایی با شما تماس می‌گیرد.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {registerNotes.map((note) => (
                <span key={note} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  {note}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-10">
              <ClinicRegistrationCard />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function BenefitVisual({
  variant,
  title,
  idSuffix,
}: {
  variant: BenefitVisualVariant;
  title: string;
  idSuffix: string;
}) {
  const baseCard =
    "relative h-full min-h-[220px] overflow-hidden rounded-[28px] border border-white/12 bg-white/5 p-5 backdrop-blur-xl";

  if (variant === "schedule") {
    const rows = [
      { time: "09:00", fill: "70%" },
      { time: "10:30", fill: "84%" },
      { time: "12:00", fill: "62%" },
    ];

    return (
      <div className={baseCard} aria-label={title}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#7EB3CC]/20 blur-[90px]" />
        <div className="flex items-center justify-between text-xs text-white/55">
          <span>زمان‌بندی امروز</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
            به‌روزرسانی زنده
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {rows.map((row) => (
            <div key={row.time} className="flex items-center gap-3">
              <div className="w-12 text-[11px] text-white/45" dir="ltr">
                {row.time}
              </div>
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30"
                  style={{ width: row.fill }}
                />
              </div>
              <span className="h-2 w-2 rounded-full bg-white/40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "payments") {
    const chartValues = [18, 36, 28, 62, 48, 78, 66];
    const width = 240;
    const height = 120;
    const padding = 12;
    const chartSpan = height - padding * 2;
    const step = (width - padding * 2) / (chartValues.length - 1);
    const points = chartValues.map((value, index) => {
      const x = padding + index * step;
      const y = height - padding - (value / 100) * chartSpan;
      return { x, y };
    });
    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${
      height - padding
    } Z`;

    return (
      <div className={baseCard} aria-label={title}>
        <div className="pointer-events-none absolute -left-10 bottom-[-40px] h-32 w-32 rounded-full bg-[#7EB3CC]/15 blur-[80px]" />
        <div className="flex items-center justify-between text-xs text-white/55">
          <span>گزارش پرداخت</span>
          <span className="text-[11px] text-white/45" dir="ltr">
            ۳۰ روز اخیر
          </span>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="نمودار پرداخت"
            className="h-32 w-full"
          >
            <defs>
              <linearGradient id={`payments-line-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#BDE8FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7EB3CC" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id={`payments-area-${idSuffix}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7EB3CC" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7EB3CC" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((line) => {
              const y = padding + (chartSpan / 3) * line;
              return (
                <line
                  key={line}
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 6"
                />
              );
            })}

            <path d={areaPath} fill={`url(#payments-area-${idSuffix})`} stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke={`url(#payments-line-${idSuffix})`}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point, index) => (
              <circle
                key={`${point.x}-${point.y}`}
                cx={point.x}
                cy={point.y}
                r={index === points.length - 1 ? 3.6 : 2.6}
                fill={index === points.length - 1 ? "#BDE8FF" : "rgba(255,255,255,0.6)"}
              />
            ))}
          </svg>
          <div
            className="mt-3 grid grid-cols-4 items-center px-[12px] text-[10px] text-white/45"
            dir="ltr"
          >
            <span className="justify-self-start" dir="rtl">
              هفته ۱
            </span>
            <span className="justify-self-center" dir="rtl">
              هفته ۲
            </span>
            <span className="justify-self-center" dir="rtl">
              هفته ۳
            </span>
            <span className="justify-self-end" dir="rtl">
              هفته ۴
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-white/50">
          <span>روند پرداخت‌های موفق</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
            +۱۴٪
          </span>
        </div>
      </div>
    );
  }

  if (variant === "notifications") {
    const alerts = [
      { title: "یادآوری ویزیت", time: "همین حالا" },
      { title: "نسخه آماده شد", time: "۳ دقیقه پیش" },
      { title: "پرداخت ثبت شد", time: "۱۲ دقیقه پیش" },
    ];

    return (
      <div className={baseCard} aria-label={title}>
        <div className="pointer-events-none absolute -right-12 top-2 h-28 w-28 rounded-full bg-white/10 blur-[70px]" />
        <div className="flex items-center justify-between text-xs text-white/55">
          <span>اطلاع‌رسانی زنده</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
            همگام
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)] motion-safe:animate-pulse" />
                <span>{alert.title}</span>
              </div>
              <span className="text-[11px] text-white/45">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={baseCard} aria-label={title}>
      <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-[#7EB3CC]/18 blur-[80px]" />
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>پروفایل بیمار</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
          فعال
        </span>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[11px] text-white/70">
            DN
          </div>
          <div>
            <div className="text-sm font-semibold text-white/90">بیمار نمونه</div>
            <div className="text-xs text-white/50">کد پرونده: ۲۴۸۹</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/70">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">نسخه فعال</div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">یادآوری بعدی</div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">سوابق درمان</div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">نوبت‌های اخیر</div>
        </div>
      </div>
    </div>
  );
}
