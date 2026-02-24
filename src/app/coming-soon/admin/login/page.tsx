"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LockKeyhole, ShieldCheck } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get("next") ?? "/coming-soon/admin";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(typeof data?.error === "string" ? data.error : "امکان ورود وجود ندارد.");
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
    <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center px-6 pb-24 pt-10">
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
            <ShieldCheck className="h-4 w-4 text-white/70" />
            ورود مدیر
          </div>
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">ورود به پنل مدیریت</h1>
            <p className="mt-2 text-sm leading-7 text-white/65">
              این بخش فقط برای مدیران دارونَو فعال است. لطفاً اطلاعات ورود را وارد کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="نام کاربری"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-black/35"
              />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="رمز عبور"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/25 focus:bg-black/35"
              />
            </div>

            {error ? <div className="text-xs text-rose-200/90">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LockKeyhole className="h-4 w-4" />
              {loading ? "در حال بررسی..." : "ورود"}
            </button>
          </form>

          <div className="text-xs text-white/45">دسترسی فقط برای IPهای تایید شده فعال است.</div>
        </div>
      </motion.div>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] w-full max-w-3xl px-6 pb-24 pt-10" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
