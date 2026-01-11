import type { Metadata } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خطای ۵۰۴ | دارونَو",
  description:
    "سرور موقتاً در دسترس نیست. لطفاً چند دقیقه دیگر دوباره تلاش کنید.",
  robots: { index: false, follow: false },
};

export default function ServerDownPage() {
  const headerList = headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip =
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    "—";
  const timestamp = new Date().toISOString().replace("T", " ").replace("Z", " UTC");

  return (
    <div className="min-h-screen bg-surface-2 text-primary-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-12">
        <section className="grid items-center gap-12 lg:grid-cols-[1.25fr,0.75fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-3xl font-semibold text-primary-700">
              <span>خطای ۵۰۴</span>
              <span className="text-muted">|</span>
              <span className="text-muted">زمان پاسخ‌گویی درگاه</span>
            </div>
            <h1 className="text-xl font-bold text-primary-800">
              سرور وب‌سایت موقتاً در دسترس نیست.
            </h1>
            <p className="text-sm text-muted">
              سرویس در حال حاضر قابل دسترسی نیست. لطفاً چند دقیقه دیگر دوباره تلاش کنید.
            </p>
            <p className="text-sm text-muted">
              در صورت ادامه مشکل با پشتیبانی دارونَو تماس بگیرید.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <svg
              className="h-56 w-56 text-muted"
              viewBox="0 0 240 240"
              fill="none"
              aria-hidden="true"
            >
              <rect x="72" y="28" width="116" height="160" rx="12" fill="#e9edf5" />
              <rect x="60" y="40" width="116" height="160" rx="12" fill="#f4f7fb" />
              <rect x="80" y="68" width="80" height="10" rx="5" fill="#c7d1df" />
              <rect x="80" y="90" width="64" height="8" rx="4" fill="#d7deea" />
              <rect x="80" y="106" width="70" height="8" rx="4" fill="#d7deea" />
              <circle cx="106" cy="128" r="6" fill="#c7d1df" />
              <circle cx="134" cy="128" r="6" fill="#c7d1df" />
              <path
                d="M103 148C109 140 131 140 137 148"
                stroke="#c7d1df"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx="176" cy="176" r="28" stroke="#c7d1df" strokeWidth="10" />
              <path
                d="M195 199L218 222"
                stroke="#c7d1df"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M42 58C42 46 52 36 64 36"
                stroke="#c7d1df"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="6 10"
              />
              <text
                x="186"
                y="48"
                fontSize="26"
                fontWeight="700"
                fill="#c7d1df"
              >
                ?
              </text>
            </svg>
          </div>
        </section>

        <footer className="mt-10">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-divider bg-surface-3 px-3 py-2 text-[11px] text-muted shadow-xs sm:gap-3 sm:rounded-full sm:px-4 sm:text-xs">
            <span>زمان ورود: {timestamp}</span>
            <span className="text-muted">|</span>
            <span>کد خطا: ۵۰۴</span>
            <span className="text-muted">|</span>
            <span>کد سرور: ۹۱۰</span>
            <span className="text-muted">|</span>
            <span>دامنه: darunow.com</span>
            <span className="text-muted">|</span>
            <span>IP شما: {ip}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
