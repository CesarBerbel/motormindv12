import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { Settings, ChevronRight } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Olá, {session?.user?.name?.split(" ")[0] ?? "Admin"} 👋
        </h1>
        <p className="mt-1 text-slate-400">Bem-vindo ao painel de controle MotorMind.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/settings"
          className="glass rounded-2xl border border-white/10 p-6 flex items-center gap-4 hover:border-brand-500/30 hover:bg-white/5 transition-all group"
        >
          <div className="size-12 rounded-xl bg-slate-700/60 flex items-center justify-center shrink-0 group-hover:bg-brand-500/20 transition-colors">
            <Settings className="size-6 text-slate-300 group-hover:text-brand-400 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">Configurações</p>
            <p className="text-sm text-slate-500 mt-0.5">Dados da oficina</p>
          </div>
          <ChevronRight className="size-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  )
}
