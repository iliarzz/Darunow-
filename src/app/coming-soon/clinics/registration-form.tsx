"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { addRegistration, createRegistrationId } from "@/lib/partner-registrations";

type FormValues = {
  clinicName: string;
  managerName: string;
  city: string;
  phone: string;
  email: string;
  specialty: string;
  note: string;
};

type FieldName = keyof FormValues;

const requiredFields: FieldName[] = ["clinicName", "managerName", "city", "phone", "email"];

const formatIranPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0098")) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith("98")) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.length > 11) digits = digits.slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

const validate = (values: FormValues) => {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!values.clinicName.trim()) errors.clinicName = "نام کلینیک ضروری است.";
  if (!values.managerName.trim()) errors.managerName = "نام مسئول ضروری است.";
  if (!values.city.trim()) errors.city = "شهر ضروری است.";
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (!phoneDigits) {
    errors.phone = "شماره تماس ضروری است.";
  } else if (!/^09\d{9}$/.test(phoneDigits)) {
    errors.phone = "شماره تماس معتبر نیست.";
  }
  if (!values.email.trim()) {
    errors.email = "ایمیل کاری ضروری است.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "ایمیل معتبر نیست.";
  }
  return errors;
};

export function ClinicRegistrationForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    clinicName: "",
    managerName: "",
    city: "",
    phone: "",
    email: "",
    specialty: "",
    note: "",
  });
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    clinicName: false,
    managerName: false,
    city: false,
    phone: false,
    email: false,
    specialty: false,
    note: false,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const showError = (field: FieldName) => touched[field] && errors[field];
  const inputBase =
    "h-12 w-full rounded-2xl border bg-black/30 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:bg-black/35";
  const errorClasses = "border-rose-400/40 focus:border-rose-300/60 focus:ring-1 focus:ring-rose-300/30";
  const normalClasses = "border-white/12 focus:border-white/18";
  const fieldWrapper = "flex min-h-[74px] flex-col";
  const updateValue = (field: FieldName, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors(validate(nextValues));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched((prev) => {
      const next = { ...prev };
      requiredFields.forEach((field) => {
        next[field] = true;
      });
      return next;
    });
    if (Object.keys(nextErrors).length > 0) return;
    addRegistration({
      id: createRegistrationId(),
      type: "clinic",
      name: values.clinicName.trim(),
      managerName: values.managerName.trim(),
      city: values.city.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      note: values.note.trim() || undefined,
      extra: values.specialty.trim() ? { specialty: values.specialty.trim() } : undefined,
      createdAt: new Date().toISOString(),
      status: "pending",
      createdBy: "user",
    });
    router.push("/coming-soon/clinics/registered");
  };

  return (
    <form className="mx-auto w-full max-w-2xl space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-x-3 gap-y-2 md:grid-cols-2">
        <div className={fieldWrapper}>
          <input
            type="text"
            required
            placeholder="نام کلینیک"
            value={values.clinicName}
            onChange={(event) => updateValue("clinicName", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, clinicName: true }))}
            aria-invalid={Boolean(showError("clinicName"))}
            aria-describedby="clinicName-error"
            className={`${inputBase} ${showError("clinicName") ? errorClasses : normalClasses}`}
          />
          <span
            id="clinicName-error"
            className="mt-0.5 block min-h-[14px] text-xs text-rose-200/80"
            aria-live="polite"
          >
            {showError("clinicName") ? errors.clinicName : ""}
          </span>
        </div>

        <div className={fieldWrapper}>
          <input
            type="text"
            required
            placeholder="نام مسئول"
            value={values.managerName}
            onChange={(event) => updateValue("managerName", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, managerName: true }))}
            aria-invalid={Boolean(showError("managerName"))}
            aria-describedby="managerName-error"
            className={`${inputBase} ${showError("managerName") ? errorClasses : normalClasses}`}
          />
          <span
            id="managerName-error"
            className="mt-0.5 block min-h-[14px] text-xs text-rose-200/80"
            aria-live="polite"
          >
            {showError("managerName") ? errors.managerName : ""}
          </span>
        </div>

        <div className={fieldWrapper}>
          <input
            type="text"
            required
            placeholder="شهر"
            value={values.city}
            onChange={(event) => updateValue("city", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
            aria-invalid={Boolean(showError("city"))}
            aria-describedby="city-error"
            className={`${inputBase} ${showError("city") ? errorClasses : normalClasses}`}
          />
          <span id="city-error" className="mt-0.5 block min-h-[14px] text-xs text-rose-200/80" aria-live="polite">
            {showError("city") ? errors.city : ""}
          </span>
        </div>

        <div className={`relative ${fieldWrapper}`}>
          <input
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="شماره"
            value={values.phone}
            onChange={(event) => updateValue("phone", formatIranPhone(event.target.value))}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            aria-invalid={Boolean(showError("phone"))}
            aria-describedby="phone-error"
            className={`peer ltr ${inputBase} text-left placeholder:text-white/40 placeholder-shown:text-right ${
              showError("phone") ? errorClasses : normalClasses
            }`}
          />
          <span id="phone-error" className="mt-0.5 block min-h-[14px] text-xs text-rose-200/80" aria-live="polite">
            {showError("phone") ? errors.phone : ""}
          </span>
        </div>

        <div className={fieldWrapper}>
          <input
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="ایمیل کاری"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            aria-invalid={Boolean(showError("email"))}
            aria-describedby="email-error"
            className={`email-ltr ${inputBase} ${showError("email") ? errorClasses : normalClasses}`}
          />
          <span id="email-error" className="mt-0.5 block min-h-[14px] text-xs text-rose-200/80" aria-live="polite">
            {showError("email") ? errors.email : ""}
          </span>
        </div>

        <div className={fieldWrapper}>
          <input
            type="text"
            placeholder="تخصص/نوع کلینیک (اختیاری)"
            value={values.specialty}
            onChange={(event) => updateValue("specialty", event.target.value)}
            className={`${inputBase} ${normalClasses}`}
          />
          <span className="mt-0.5 block min-h-[14px]" aria-hidden="true" />
        </div>
      </div>

      <textarea
        rows={3}
        placeholder="توضیح کوتاه (اختیاری)"
        value={values.note}
        onChange={(event) => updateValue("note", event.target.value)}
        className="min-h-[96px] w-full resize-none rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/18 focus:bg-black/35"
      />

      <button
        type="submit"
        className="h-12 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px] active:translate-y-0"
      >
        ثبت درخواست همکاری
      </button>
    </form>
  );
}

export function ClinicRegistrationCard() {
  const [view, setView] = useState<"intro" | "form">("intro");
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" };

  return (
    <motion.div
      layout
      className="rounded-[36px] bg-gradient-to-br from-white/15 via-white/5 to-transparent p-[1px]"
      transition={transition}
    >
      <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-white/5 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-1/3 h-40 w-40 rounded-full bg-[#7EB3CC]/18 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-40 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="light-sweep absolute -inset-y-1/2 left-0 w-[160%] opacity-35" />
        </div>

        <div className="relative p-6 md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {view === "intro" ? (
              <motion.div
                key="intro"
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                transition={transition}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                    <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                    فرم ثبت کلینیک
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                    مرحله ۱ از ۲
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white/90 md:text-xl">ثبت درخواست همکاری</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  فرم کوتاه است و فقط اطلاعات پایه نیاز داریم تا هماهنگی آغاز شود.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {["۵ دقیقه زمان", "پاسخ طی ۲۴ ساعت", "هماهنگی اختصاصی"].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setView("form")}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px]"
                  >
                    شروع ثبت درخواست همکاری
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                transition={transition}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                    <span className="h-1 w-6 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30" />
                    فرم ثبت کلینیک
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("intro")}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60 transition hover:border-white/25 hover:text-white/80"
                  >
                    بازگشت
                  </button>
                </div>

                <div className="mt-4 mx-auto max-w-2xl text-right">
                  <h3 className="text-lg font-semibold text-white/90 md:text-xl">اطلاعات پایه</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    این اطلاعات برای آغاز همکاری کافی است. مدارک تکمیلی بعداً دریافت می‌شود.
                  </p>
                </div>

                <div className="mt-6">
                  <ClinicRegistrationForm />
                </div>
                <div className="mt-4 mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55">
                  پس از ثبت، تیم ما طی ۲۴ ساعت کاری با شما تماس می‌گیرد.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
