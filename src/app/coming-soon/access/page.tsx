"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { KeyRound, Sparkles } from "lucide-react";

function AccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get("next") ?? "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/app-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(typeof data?.error === "string" ? data.error : "کد دسترسی معتبر نیست.");
        setLoading(false);
        return;
      }
      router.replace(nextPath);
    } catch (err) {
      setError("ارتباط با سرور برقرار نشد.");
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 pb-24 pt-10">
      <motion.div
        className="relative w-full overflow-hidden rounded-[32px] border border-white/12 bg-white/5 p-8 text-right backdrop-blur-xl md:p-12"
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/3 h-40 w-40 rounded-full bg-[#7EB3CC]/18 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-40 w-52 rounded-full bg-white/10 blur-3xl" />

        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <Sparkles className="h-4 w-4 text-white/70" />
            دسترسی ویژه
          </div>
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">ورود با کد دسترسی</h1>
            <p className="mt-2 text-sm leading-7 text-white/65">
              نسخه وب دارونَو هنوز در مرحله‌ی آماده‌سازی است. اگر کد دسترسی دارید، اینجا وارد کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="password"
                required
                autoComplete="one-time-code"
                placeholder="کد دسترسی"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-black/35 md:flex-1"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <KeyRound className="h-4 w-4" />
                {loading ? "در حال بررسی..." : "ورود"}
              </button>
            </div>

            {error ? <div className="text-xs text-rose-200/90">{error}</div> : null}
          </form>

          <div className="text-xs text-white/45">در صورت نداشتن کد، با تیم دارونَو هماهنگ کنید.</div>
        </div>
      </motion.div>
    </section>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] w-full max-w-3xl px-6 pb-24 pt-10" />}>
      <AccessForm />
    </Suspense>
  );
}
