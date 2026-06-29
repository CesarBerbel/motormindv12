import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/layout/DashboardNav"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardNav user={session.user} role={(session.user as { role?: string }).role ?? ""} />
      <main className="pt-14 sm:pt-16 pb-16 sm:pb-0">{children}</main>
    </div>
  )
}
