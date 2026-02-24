import { ComingSoonHeader } from "@/components/coming-soon/coming-soon-header";

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return (
    <main dir="rtl" lang="fa" className="coming-soon-theme relative min-h-screen bg-[#070A0F] text-white no-copy">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-52 left-1/2 hidden h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[#1D456B]/55 blur-[140px] animate-floatSlow md:block" />
        <div className="absolute top-20 right-[-200px] hidden h-[480px] w-[480px] rounded-full bg-[#7EB3CC]/25 blur-[140px] animate-floatSlower lg:block" />
        <div className="absolute -bottom-64 -left-52 hidden h-[640px] w-[640px] rounded-full bg-[#6090AD]/20 blur-[160px] lg:block" />
        <div className="light-sweep absolute inset-y-0 left-[-45%] hidden w-[190%] opacity-20 md:block" />
        <div className="absolute inset-0 hidden opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:64px_64px] md:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 hidden opacity-[0.06] mix-blend-overlay noise md:block" />
      </div>

      <div className="relative">
        <ComingSoonHeader />
        {children}
      </div>
    </main>
  );
}
