import type { Metadata } from "next";
import { Parallax } from "@/components/motion/parallax";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { HospitalRegistrationCard } from "./registration-form";

export const metadata: Metadata = {
  title: "دارونَو — ثبت همکاری بیمارستان‌ها",
  description: "بیمارستان خود را در دارونَو ثبت کنید و به شبکه همکاری بپیوندید.",
};

const heroHighlights = ["پایش ۲۴/۷", "هماهنگی بین‌بخشی", "امنیت داده"];

const signalRows = [
  { label: "اورژانس", value: "فعال", percent: 74 },
  { label: "ICU", value: "پایدار", percent: 62 },
  { label: "اتاق عمل", value: "هماهنگ", percent: 81 },
];

const flowSteps = [
  {
    title: "ثبت اطلاعات مرکز",
    description: "اطلاعات پایه بیمارستان و راه ارتباطی را ثبت کنید.",
  },
  {
    title: "راستی‌آزمایی و هماهنگی",
    description: "اطلاعات بررسی می‌شود و برای هماهنگی نهایی تماس می‌گیریم.",
  },
  {
    title: "فعال‌سازی عملیاتی",
    description: "پس از تأیید، دسترسی تیم بیمارستان فعال می‌شود.",
  },
];

const registerNotes = [
  "مدارک تکمیلی در مرحله بعدی دریافت می‌شود.",
  "هماهنگی سریع برای تعریف سطح دسترسی.",
  "آموزش کوتاه و شروع رسمی فعالیت.",
];

export default function HospitalRegisterPage() {
  return (
    <>
      <section className="relative mx-auto min-h-[92vh] max-w-7xl px-6 pb-20 pt-12">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">
          <div className="absolute left-1/4 top-8 h-44 w-52 rounded-full bg-[#7EB3CC]/16 blur-[130px]" />
          <div className="absolute right-1/3 top-28 h-56 w-64 rounded-full bg-white/10 blur-[160px]" />
          <div className="light-sweep absolute -inset-y-1/2 left-0 w-[200%] opacity-45" />
        </div>

        <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:[direction:ltr]">
          <div className="space-y-6 text-center md:text-right lg:[direction:rtl]">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7EB3CC] shadow-[0_0_16px_rgba(126,179,204,0.9)]" />
                برای بیمارستان‌ها
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h1 className="text-balance text-[clamp(2.4rem,5vw,3.8rem)] font-semibold leading-[1.18] tracking-normal">
                هماهنگی حیاتی، با دید لحظه‌ای
                <span className="mt-3 block bg-gradient-to-l from-[#7EB3CC] via-white to-white bg-clip-text text-transparent">
                  اورژانس، ICU، انتقال — در یک اتاق فرمان.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-sm leading-7 text-white/70 md:text-base">
                دارونَو برای بیمارستان‌هایی است که تصمیم‌های حساس باید سریع، دقیق و هماهنگ باشد.
                مسیر ثبت کوتاه است و همکاری مرحله‌ای پیش می‌رود.
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
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                {heroHighlights.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.12} className="lg:[direction:rtl]">
            <Parallax distance={26}>
              <CommandDeck />
            </Parallax>
          </ScrollReveal>
        </div>
      </section>

      <section id="capabilities" className="mx-auto flex min-h-[84vh] max-w-6xl items-center px-6 pb-24">
        <div className="w-full space-y-8">
          <ScrollReveal>
            <div className="rounded-[32px] border border-white/12 bg-white/5 px-6 py-8 text-right backdrop-blur-xl md:px-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                چرا دارونَو؟
              </div>
              <h2 className="mt-4 text-balance text-2xl font-semibold text-white/90 md:text-3xl">
                عملیات بیمارستانی بدون اختلال
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                داده‌ها امن می‌مانند، ارتباط‌ها یکپارچه‌اند و کنترل لحظه‌ای است.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <ScrollReveal className="h-full">
              <div className="h-full rounded-[32px] border border-white/12 bg-white/5 p-6 text-right backdrop-blur-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/45">شبکه هماهنگی</div>
                    <div className="mt-2 text-lg font-semibold text-white/90">هماهنگی مراکز درمانی</div>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      مسیرهای ارتباطی، انتقال‌ها و وضعیت بخش‌ها در یک نقشه واحد دیده می‌شود.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    یکپارچه
                  </span>
                </div>
                <NetworkVisual />
              </div>
            </ScrollReveal>

            <div className="grid gap-4">
              <ScrollReveal>
                <div className="rounded-[28px] border border-white/12 bg-white/5 p-5 text-right backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white/90">تسهیم داده امن</div>
                    <span className="text-[11px] text-white/55">چندلایه</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    تبادل اطلاعات با دسترسی‌های شفاف و کنترل‌شده انجام می‌شود.
                  </p>
                  <SecurityVisual />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.05}>
                <div className="rounded-[28px] border border-white/12 bg-white/5 p-5 text-right backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white/90">کنترل لحظه‌ای</div>
                    <span className="text-[11px] text-white/55">زنده</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    هشدارها، وضعیت بخش‌ها و گردش کار در لحظه قابل مشاهده است.
                  </p>
                  <LiveControlVisual />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section id="flow" className="mx-auto flex min-h-[76vh] max-w-6xl items-center px-6 pb-24">
        <div className="w-full">
          <ScrollReveal>
            <div className="rounded-[28px] border border-white/12 bg-white/5 p-6 text-center backdrop-blur-xl md:p-7">
              <div className="text-xs text-white/45">مسیر همکاری</div>
              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">سه گام تا اتصال عملیاتی</h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                فرآیند شفاف و مرحله‌ای است تا بدون وقفه به نتیجه برسید.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            <ScrollReveal
              delay={0.5}
              repeat={false}
              className="pointer-events-none absolute left-6 right-6 top-6 z-0 hidden md:block"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </ScrollReveal>
            {flowSteps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 0.08} className="h-full">
                <div className="relative z-10 flex h-full flex-col rounded-[28px] border border-white/12 bg-white/5 p-6 text-right backdrop-blur-xl transition duration-300 hover:border-white/25">
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
              <HospitalRegistrationCard />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function CommandDeck() {
  const statusItems = [
    {
      label: "اورژانس",
      value: "فعال",
      badgeClass: "bg-emerald-400/15 text-emerald-100 ring-emerald-400/20",
    },
    {
      label: "ICU",
      value: "پایدار",
      badgeClass: "bg-[#7EB3CC]/15 text-[#D6F0FF] ring-[#7EB3CC]/25",
    },
    {
      label: "بخش‌ها",
      value: "۴",
      badgeClass: "bg-white/10 text-white/80 ring-white/20",
    },
  ];

  return (
    <div className="rounded-[38px] bg-gradient-to-br from-white/20 via-white/5 to-transparent p-[1px]">
      <div className="relative rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_40px_140px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
          <div className="light-sweep absolute -inset-y-1/2 left-0 w-[200%] opacity-35" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">اتاق فرمان بیمارستان</div>
          <span className="rounded-full bg-[#7EB3CC]/15 px-3 py-1 text-xs text-[#D6F0FF] ring-1 ring-[#7EB3CC]/20">
            مانیتور زنده
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="text-xs text-white/55">ظرفیت فعال</div>
            <div className="mt-4 flex items-start gap-4">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#7EB3CC 0deg, #BDE8FF 220deg, rgba(255,255,255,0.12) 220deg)",
                  }}
                />
                <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full border border-white/10 bg-[#0B1220]/90">
                  <div className="text-lg font-semibold text-white/90">۸۶٪</div>
                  <div className="text-[10px] text-white/60">اشغال</div>
                </div>
              </div>
              <div className="space-y-2 text-xs text-white/70">
                {statusItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span>{item.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${item.badgeClass}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {signalRows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
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
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4">
          <div className="text-xs text-white/55">انتقال بین‌مرکزی</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/90">۳ درخواست فعال</span>
            <span className="text-[11px] text-white/45">۲ در مسیر</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["هماهنگی اورژانس", "ارسال پرونده", "تأیید مقصد"].map((chip) => (
              <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkVisual() {
  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>نقشه ارتباطی</span>
        <span className="text-[11px] text-white/45">۴ مرکز همکار</span>
      </div>
      <svg viewBox="0 0 240 140" className="mt-4 h-36 w-full">
        <defs>
          <linearGradient id="network-line" x1="0" x2="1">
            <stop offset="0%" stopColor="#7EB3CC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <line x1="120" y1="30" x2="50" y2="60" stroke="url(#network-line)" strokeWidth="1.4" />
        <line x1="120" y1="30" x2="190" y2="60" stroke="url(#network-line)" strokeWidth="1.4" />
        <line x1="120" y1="30" x2="70" y2="110" stroke="url(#network-line)" strokeWidth="1.4" />
        <line x1="120" y1="30" x2="170" y2="110" stroke="url(#network-line)" strokeWidth="1.4" />
        <circle cx="120" cy="30" r="10" fill="#7EB3CC" opacity="0.9" />
        <circle cx="50" cy="60" r="6" fill="rgba(255,255,255,0.7)" />
        <circle cx="190" cy="60" r="6" fill="rgba(255,255,255,0.6)" />
        <circle cx="70" cy="110" r="6" fill="rgba(255,255,255,0.5)" />
        <circle cx="170" cy="110" r="6" fill="rgba(255,255,255,0.7)" />
        <circle cx="120" cy="30" r="18" fill="rgba(126,179,204,0.15)" />
      </svg>
    </div>
  );
}

function SecurityVisual() {
  const layers = [
    { label: "هویت و احراز", level: "L1", percent: 86 },
    { label: "نقش‌ها و دسترسی", level: "L2", percent: 74 },
    { label: "ثبت رخداد", level: "L3", percent: 62 },
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>لایه‌های دسترسی</span>
        <span className="text-[11px] text-white/45">سطح سازمانی</span>
      </div>
      <div className="mt-4 space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.label}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>{layer.label}</span>
              <span className="text-[10px] text-white/45">{layer.level}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div
                className="h-1.5 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30"
                style={{ width: `${layer.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveControlVisual() {
  const alerts = [
    { title: "هشدار ظرفیت ICU", time: "هم‌اکنون" },
    { title: "درخواست انتقال", time: "۴ دقیقه پیش" },
    { title: "به‌روزرسانی پرونده", time: "۱۲ دقیقه پیش" },
  ];

  return (
    <div className="mt-4 space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.title}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)] motion-safe:animate-pulse" />
            <span>{alert.title}</span>
          </div>
          <span className="text-[11px] text-white/45">{alert.time}</span>
        </div>
      ))}
    </div>
  );
}
