"use client";

type StickyPartnerCtaProps = {
  href?: string;
  label?: string;
};

export function StickyPartnerCta({
  href = "#register",
  label = "شروع ثبت درخواست همکاری",
}: StickyPartnerCtaProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] md:hidden">
      <div className="mx-auto max-w-2xl">
        <a
          href={href}
          className="pointer-events-auto inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-[#050913] shadow-[0_22px_48px_rgba(0,0,0,0.55)]"
        >
          {label}
        </a>
      </div>
    </div>
  );
}
