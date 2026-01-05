export default function ComingSoonLoading() {
  return (
    <div className="relative min-h-screen bg-[#070A0F] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-52 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[#1D456B]/55 blur-[140px]" />
        <div className="absolute top-20 right-[-200px] h-[480px] w-[480px] rounded-full bg-[#7EB3CC]/25 blur-[140px]" />
        <div className="absolute -bottom-64 -left-52 h-[640px] w-[640px] rounded-full bg-[#6090AD]/20 blur-[160px]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay noise" />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="h-2 w-24 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
