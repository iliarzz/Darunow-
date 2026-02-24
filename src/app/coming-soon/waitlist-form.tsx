"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { addRegistration, createRegistrationId } from "@/lib/partner-registrations";

type WaitlistFormProps = {
  className?: string;
};

export function WaitlistForm({ className }: WaitlistFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!emailIsValid || submitting) return;
    setSubmitting(true);
    addRegistration({
      id: createRegistrationId(),
      type: "waitlist",
      name: "عضویت لیست انتظار",
      email: email.trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
      createdBy: "user",
    });
    router.push("/coming-soon/registered");
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <form className="flex flex-col gap-2 md:flex-row md:items-center" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="ایمیل شما"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={submitted && !emailIsValid}
          className="email-ltr h-12 flex-1 rounded-2xl border border-white/12 bg-black/30 px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/18 focus:bg-black/35"
        />
        <button
          type="submit"
          disabled={!emailIsValid || submitting}
          className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:translate-y-[-1px] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? "در حال ثبت..." : "ثبت"}
        </button>
      </form>
      {submitted && !emailIsValid ? (
        <div className="text-center text-xs text-rose-200/90">ایمیل معتبر وارد کنید.</div>
      ) : null}
      {emailIsValid ? (
        <div className="text-center text-xs text-emerald-200/85">فرم آماده ثبت است.</div>
      ) : null}
      <div className="text-center text-xs text-white/45">
        بدون اسپم. فقط اطلاع‌رسانی انتشار و دعوت بتا.
      </div>
    </div>
  );
}
