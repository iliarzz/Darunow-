import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export const metadata: Metadata = {
  title: "دارونَو — چشم‌انداز",
  description: "چشم‌انداز دارونَو برای سلامت انسانی، قابل اعتماد و همیشه در دسترس.",
};

const heroChips = ["انسانی", "قابل اعتماد", "همیشه در دسترس", "همراه در بحران"];

const manifestoBlocks = [
  {
    title: "سلامت، همیشه",
    description: "سلامت نباید وابسته به زمان یا مکان باشد؛ همیشه باید در دسترس باشد.",
  },
  {
    title: "انسان در مرکز",
    description: "هر تصمیم باید به آرامش بیمار و تمرکز تیم درمان کمک کند.",
  },
  {
    title: "اعتماد پایدار",
    description: "شفافیت و پیگیری دقیق، اعتماد را می‌سازد و حفظ می‌کند.",
  },
];

const originPoints = [
  {
    title: "تأخیرهای کوچک",
    description: "یک توقف کوتاه می‌تواند اضطراب بیمار را افزایش دهد.",
  },
  {
    title: "ناهماهنگی ساده",
    description: "گسست اطلاعات، مسیر درمان را کند و مبهم می‌کند.",
  },
  {
    title: "مسیرهای نادرست",
    description: "بی‌نظمی، تصمیم درست را سخت‌تر می‌سازد.",
  },
];

const rolePoints = [
  {
    title: "اتصال یکپارچه",
    description: "ارتباط میان بیمار، پزشک، داروخانه و مراکز درمانی منسجم می‌شود.",
  },
  {
    title: "مسیر روشن",
    description: "فرآیند درمان کوتاه‌تر، واضح‌تر و قابل پیگیری خواهد بود.",
  },
  {
    title: "فناوری در خدمت درمان",
    description: "تصمیم‌های پزشکی در اختیار پزشک باقی می‌ماند؛ فناوری فقط مسیر را هموار می‌کند.",
  },
];

const alignmentTrack = [
  { title: "بیمار", description: "شفافیت مسیر و آرامش در هر قدم" },
  { title: "پزشک", description: "اطلاعات کامل برای تصمیم دقیق" },
  { title: "داروخانه", description: "هماهنگی سریع و اجرای مطمئن" },
  { title: "مرکز درمانی", description: "عملیات یکپارچه و امن" },
];

const humanMoments = [
  {
    title: "بیمار سردرگم نمی‌شود",
    description: "هر مرحله روشن است و بیمار می‌داند در چه مسیری قرار دارد.",
  },
  {
    title: "پزشک با تمرکز کار می‌کند",
    description: "آرامش در اطلاعات یعنی تمرکز بیشتر روی درمان تخصصی.",
  },
  {
    title: "فرآیند قابل اعتماد است",
    description: "شفافیت، امنیت و پیگیری دقیق، اعتماد را ماندگار می‌کند.",
  },
];

const futureSteps = [
  {
    title: "همراه روزمره",
    description: "در شرایط عادی، دارونَو یک همراه بی‌صدا و مطمئن است.",
  },
  {
    title: "پشتیبان در سختی",
    description: "در شرایط بحرانی، مسیر درمان کوتاه و قابل اتکا باقی می‌ماند.",
  },
  {
    title: "حق سلامت برای همه",
    description: "سلامت یک امتیاز نیست؛ حقی است که همیشه باید در دسترس باشد.",
  },
];

export default function VisionPage() {
  return (
    <>
      <section className="relative mx-auto min-h-[82vh] max-w-6xl px-6 pb-16 pt-14">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">
          <div className="absolute left-1/4 top-16 h-40 w-40 rounded-full bg-[#7EB3CC]/18 blur-[120px]" />
          <div className="absolute right-1/4 top-6 h-44 w-56 rounded-full bg-white/10 blur-[140px]" />
          <div className="light-sweep absolute -inset-y-1/2 left-0 w-[180%] opacity-35" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="text-right">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7EB3CC] shadow-[0_0_16px_rgba(126,179,204,0.9)]" />
                چشم‌انداز دارونَو
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h1 className="mt-5 text-balance text-[clamp(2.6rem,6vw,4.3rem)] font-semibold leading-[1.18] tracking-normal">
                سلامت، برای همیشه و برای همه
                <span className="mt-4 block bg-gradient-to-l from-[#7EB3CC] via-white to-white bg-clip-text text-transparent">
                  تجربه‌ای انسانی، آرام و قابل اعتماد.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                دارونَو می‌خواهد سلامت دیگر وابسته به زمان، مکان یا شرایط خاص نباشد؛ دسترسی به خدمات
                درمانی باید ساده، قابل اعتماد و انسانی باقی بماند — حتی در روزهای دشوار.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px] text-white/55">
                {heroChips.map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {chip}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.12}>
            <Parallax distance={18}>
              <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/5 p-6 backdrop-blur-xl shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-12 right-8 h-24 w-24 rounded-full bg-[#7EB3CC]/20 blur-3xl" />
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </div>
                <div className="relative">
                  <div className="text-xs text-white/55">بیانیه کوتاه</div>
                  <div className="mt-4 space-y-4">
                    {manifestoBlocks.map((block) => (
                      <div key={block.title} className="border-r border-white/15 pr-4">
                        <div className="text-sm font-semibold text-white/90">{block.title}</div>
                        <div className="mt-1 text-xs leading-6 text-white/60">{block.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Parallax>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto flex min-h-[72vh] max-w-6xl items-center px-6 pb-20">
        <ScrollReveal>
          <div className="rounded-[34px] border border-white/12 bg-white/5 px-6 py-8 backdrop-blur-xl md:px-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div className="space-y-3">
                <div className="text-xs text-white/45">از دل تجربه</div>
                <h2 className="text-2xl font-semibold md:text-3xl">چرا دارونَو شکل گرفت؟</h2>
                <p className="text-sm leading-7 text-white/70 md:text-base">
                  دارونَو از مشاهده مستقیم چالش‌های نظام سلامت شکل گرفته است؛ جایی که یک تأخیر کوچک
                  یا یک ناهماهنگی ساده می‌تواند به اضطراب بیمار و اختلال در درمان منجر شود.
                </p>
                <p className="text-sm leading-7 text-white/70 md:text-base">
                  ما برای پاسخ‌دادن به همین لحظه‌ها ساخته شدیم؛ جایی که سرعت و آرامش باید هم‌زمان حضور داشته باشد.
                </p>
              </div>

              <div className="space-y-3">
                {originPoints.map((point, index) => (
                  <div
                    key={point.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-white/70">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/90">{point.title}</div>
                      <div className="mt-1 text-xs leading-6 text-white/60">{point.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto flex min-h-[76vh] max-w-6xl items-center px-6 pb-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <ScrollReveal className="order-2 lg:order-1">
            <div className="space-y-4">
              <div className="text-xs text-white/45">نقش دارونَو</div>
              <h2 className="text-2xl font-semibold md:text-3xl">پیوند هوشمند میان درمان و فناوری</h2>
              <p className="text-sm leading-7 text-white/70 md:text-base">
                دارونَو با کنار هم آوردن فناوری و زیرساخت درمانی، ارتباط میان بیمار، پزشک،
                داروخانه و مراکز درمانی را ساده‌تر و منسجم‌تر می‌کند.
              </p>
              <p className="text-sm leading-7 text-white/70 md:text-base">
                ما مسیر درمان را کوتاه‌تر و روشن‌تر می‌سازیم؛ نه با دخالت در تصمیم‌های پزشکی،
                بلکه با فراهم‌کردن شرایطی که تصمیم درست، آسان‌تر گرفته شود.
              </p>
              <div className="mt-4 space-y-3">
                {rolePoints.map((point) => (
                  <div key={point.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-sm font-semibold text-white/85">{point.title}</div>
                    <div className="mt-1 text-xs text-white/60">{point.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12} className="order-1 lg:order-2">
            <Parallax distance={18}>
              <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-white/5 p-6 backdrop-blur-xl shadow-[0_40px_140px_rgba(0,0,0,0.6)]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-20 left-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute -bottom-16 right-10 h-24 w-28 rounded-full bg-[#7EB3CC]/18 blur-3xl" />
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between text-xs text-white/55">
                    <span>نقاط اتصال</span>
                    <span className="text-[11px] text-white/45">یک شبکه هماهنگ</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {alignmentTrack.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                        <div className="text-sm font-semibold text-white/90">{item.title}</div>
                        <div className="mt-1 text-xs text-white/60">{item.description}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                    فناوری فقط مسیر را هموار می‌کند؛ مسئولیت درمان همچنان بر عهده پزشک است.
                  </div>
                </div>
              </div>
            </Parallax>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto flex min-h-[68vh] max-w-6xl items-center px-6 pb-20">
        <div className="w-full space-y-8">
          <ScrollReveal>
            <div className="flex flex-col gap-3 text-right">
              <div className="text-xs text-white/45">سلامت، فراتر از یک خدمت</div>
              <h2 className="text-2xl font-semibold md:text-3xl">تجربه‌ای انسانی، شفاف و قابل اعتماد</h2>
              <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base">
                سلامت پیش از هر چیز به احساس امنیت و اطمینان نیاز دارد. دارونَو تلاش می‌کند این احساس
                را در هر نقطه از مسیر درمان حفظ کند.
              </p>
            </div>
          </ScrollReveal>

          <div className="overflow-hidden rounded-[30px] border border-white/12 bg-white/5 backdrop-blur-xl">
            {humanMoments.map((moment, index) => (
              <ScrollReveal key={moment.title} delay={index * 0.05}>
                <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-6 first:border-t-0 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-white/80">{`0${index + 1}`}</div>
                    <div className="text-sm font-semibold text-white/90">{moment.title}</div>
                  </div>
                  <div className="max-w-xl text-xs leading-6 text-white/60 md:text-sm">{moment.description}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex min-h-[68vh] max-w-6xl items-center px-6 pb-24">
        <ScrollReveal>
          <div className="rounded-[34px] border border-white/12 bg-white/5 px-6 py-10 backdrop-blur-xl md:px-10">
            <div className="text-xs text-white/45">نگاه ما به آینده</div>
            <h2 className="mt-4 text-balance text-2xl font-semibold text-white/90 md:text-3xl">
              سلامت، بخشی قابل اتکا از زندگی روزمره
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
              دارونَو در مسیر تبدیل‌شدن به بستری قابل اتکا حرکت می‌کند؛ همراه در روزهای عادی و پشتیبان
              در روزهای دشوار.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {futureSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/70 ${
                    index === 1 ? "md:translate-y-3" : index === 2 ? "md:translate-y-6" : ""
                  }`}
                >
                  <div className="text-[11px] text-white/45">{`0${index + 1}`}</div>
                  <div className="mt-1 text-sm font-semibold text-white/90">{step.title}</div>
                  <div className="mt-2 text-xs leading-6 text-white/60">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto flex min-h-[54vh] max-w-5xl items-center px-6 pb-24">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-white/5 px-6 py-12 text-center backdrop-blur-xl md:px-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-12 right-10 h-32 w-32 rounded-full bg-[#7EB3CC]/18 blur-3xl" />
              <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            </div>
            <div className="relative">
              <div className="text-xs text-white/45">جمله پایانی</div>
              <h2 className="mt-4 text-balance text-2xl font-semibold text-white/90 md:text-3xl">
                دارونَو برای مراقبت ساخته شده است؛ برای روزهای آرام و روزهای سخت.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                آینده‌ای که سرعت و اعتماد کنار هم قرار می‌گیرند و سلامت به تجربه‌ای آرام تبدیل می‌شود.
              </p>
              <Link
                href="/coming-soon"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:translate-y-[-1px]"
              >
                بازگشت به به‌زودی
                <ArrowLeft className="h-4 w-4 text-black/60" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
