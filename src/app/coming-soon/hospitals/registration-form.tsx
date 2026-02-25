"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { addRegistration, createRegistrationId } from "@/lib/partner-registrations";

type FormValues = {
  hospitalName: string;
  managerName: string;
  city: string;
  phone: string;
  email: string;
  department: string;
  bedCount: string;
  note: string;
};

type FieldName = keyof FormValues;

const requiredFields: FieldName[] = ["hospitalName", "managerName", "city", "phone", "email"];

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
  if (!values.hospitalName.trim()) errors.hospitalName = "نام بیمارستان ضروری است.";
  if (!values.managerName.trim()) errors.managerName = "نام مسئول هماهنگی ضروری است.";
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

export function HospitalRegistrationForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    hospitalName: "",
    managerName: "",
    city: "",
    phone: "",
    email: "",
    department: "",
    bedCount: "",
    note: "",
  });
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    hospitalName: false,
    managerName: false,
    city: false,
    phone: false,
    email: false,
    department: false,
    bedCount: false,
    note: false,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const currentErrors = validate(values);
  const completedRequired = requiredFields.filter((field) => !currentErrors[field]).length;
  const remainingRequired = requiredFields.length - completedRequired;
  const progressPercent = Math.round((completedRequired / requiredFields.length) * 100);
  const isFormValid = remainingRequired === 0;

  const showError = (field: FieldName) => touched[field] && errors[field];
  const inputBase =
    "h-12 w-full rounded-2xl border bg-black/30 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:bg-black/35";
  const errorClasses = "border-rose-400/40 focus:border-rose-300/60 focus:ring-1 focus:ring-rose-300/30";
  const normalClasses = "border-white/12 focus:border-white/18";
  const fieldWrapper = "flex min-h-[74px] flex-col";
  const updateValue = (field: FieldName, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (hasSubmitted || touched[field]) {
      setErrors(validate(nextValues));
    }
  };
  const handleFieldBlur = (field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched((prev) => {
      const next = { ...prev };
      requiredFields.forEach((field) => {
        next[field] = true;
      });
      return next;
    });
    if (Object.keys(nextErrors).length > 0 || !isFormValid) return;
    addRegistration({
      id: createRegistrationId(),
      type: "hospital",
      name: values.hospitalName.trim(),
      managerName: values.managerName.trim(),
      city: values.city.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      note: values.note.trim() || undefined,
      extra: {
        ...(values.department.trim() ? { department: values.department.trim() } : {}),
        ...(values.bedCount.trim() ? { bedCount: values.bedCount.trim() } : {}),
      },
      createdAt: new Date().toISOString(),
      status: "pending",
      createdBy: "user",
    });
    router.push("/coming-soon/hospitals/registered");
  };

  return (
    <form className="mx-auto w-full max-w-2xl space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-white/65">
          <span>تکمیل فرم</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-gradient-to-l from-[#7EB3CC] to-white/30"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-white/60">
          {isFormValid ? "فرم آماده ارسال است." : `${remainingRequired} فیلد الزامی باقی مانده است.`}
        </div>
      </div>

      <div className="grid gap-x-3 gap-y-2 md:grid-cols-2">
        <div className={fieldWrapper}>
          <input
            type="text"
            required
            placeholder="نام بیمارستان"
            value={values.hospitalName}
            onChange={(event) => updateValue("hospitalName", event.target.value)}
            onBlur={() => handleFieldBlur("hospitalName")}
            aria-invalid={Boolean(showError("hospitalName"))}
            aria-describedby="hospitalName-error"
            className={`${inputBase} ${showError("hospitalName") ? errorClasses : normalClasses}`}
          />
          <span
            id="hospitalName-error"
            className="mt-0.5 block min-h-[14px] text-xs text-rose-200/80"
            aria-live="polite"
          >
            {showError("hospitalName") ? errors.hospitalName : ""}
          </span>
        </div>

        <div className={fieldWrapper}>
          <input
            type="text"
            required
            placeholder="نام مسئول هماهنگی"
            value={values.managerName}
            onChange={(event) => updateValue("managerName", event.target.value)}
            onBlur={() => handleFieldBlur("managerName")}
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
            onBlur={() => handleFieldBlur("city")}
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
            onBlur={() => handleFieldBlur("phone")}
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
            onBlur={() => handleFieldBlur("email")}
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
            placeholder="بخش اصلی/تخصص (اختیاری)"
            value={values.department}
            onChange={(event) => updateValue("department", event.target.value)}
            className={`${inputBase} ${normalClasses}`}
          />
          <span className="mt-0.5 block min-h-[14px]" aria-hidden="true" />
        </div>

        <div className={fieldWrapper}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="تعداد تخت (اختیاری)"
            value={values.bedCount}
            onChange={(event) => updateValue("bedCount", event.target.value.replace(/\D/g, ""))}
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
        disabled={!isFormValid}
        className="cs-hover-smooth h-12 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        ثبت درخواست همکاری
      </button>
      {isFormValid ? (
        <div className="text-center text-xs text-emerald-200/85">همه فیلدهای الزامی کامل است.</div>
      ) : null}
    </form>
  );
}

export function HospitalRegistrationCard() {
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
                    فرم ثبت بیمارستان
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
                  {["پاسخ طی ۲۴ ساعت", "فعال‌سازی مرحله‌ای", "همراهی اختصاصی"].map((item) => (
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
                    className="cs-hover-smooth inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-[#050913] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:translate-y-[-1px]"
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
                    فرم ثبت بیمارستان
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                      مرحله ۲ از ۲
                    </span>
                    <button
                      type="button"
                      onClick={() => setView("intro")}
                      className="cs-hover-smooth rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60 transition hover:border-white/25 hover:text-white/80"
                    >
                      بازگشت
                    </button>
                  </div>
                </div>

                <div className="mt-4 mx-auto max-w-2xl text-right">
                  <h3 className="text-lg font-semibold text-white/90 md:text-xl">اطلاعات پایه</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    این اطلاعات برای آغاز همکاری کافی است. مدارک تکمیلی بعداً دریافت می‌شود.
                  </p>
                </div>

                <div className="mt-6">
                  <HospitalRegistrationForm />
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
