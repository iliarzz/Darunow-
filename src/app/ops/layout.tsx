export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-2">
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
