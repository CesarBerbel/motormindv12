export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full bg-brand-600/12 blur-[90px]" />
        <div className="absolute bottom-0 right-0 size-[400px] rounded-full bg-brand-900/25 blur-[70px]" />
      </div>
      {/* Dot grid */}
      <div className="pointer-events-none fixed inset-0 dot-grid"
        style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)" }} />

      {/* Logo above card */}
      <div className="relative z-10 mb-6 text-center">
        <span className="text-2xl font-extrabold gradient-text tracking-tight">MotorMind</span>
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
