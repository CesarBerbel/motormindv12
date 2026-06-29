import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { Settings, ChevronRight, Users } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

const CARD_CLS =
  "group relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex items-center gap-4 hover:border-brand-500/25 hover:bg-white/[0.06] transition-all duration-200 overflow-hidden"
const SHINE_CLS =
  "absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent group-hover:via-brand-400/30 transition-all"
const CHEVRON_CLS =
  "size-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"

export default async function DashboardPage() {
  const session = await auth()
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin"

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Welcome */}
      <div className="mb-10 relative">
        <div className="pointer-events-none absolute -left-8 -top-8 size-48 bg-brand-500/8 rounded-full blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-1">Painel de Controle</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Olá, {firstName} 👋
        </h1>
        <p className="mt-1.5 text-slate-400 text-sm">Bem-vindo ao MotorMind. Selecione um módulo para começar.</p>
      </div>

      {/* Módulos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/customers" className={CARD_CLS}>
          <div className={SHINE_CLS} />
          <div className="size-12 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/18 group-hover:ring-emerald-500/35 transition-all">
            <Users className="size-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">Clientes</p>
            <p className="text-xs text-slate-500 mt-0.5">Cadastro de clientes</p>
          </div>
          <ChevronRight className={CHEVRON_CLS} />
        </Link>

        <Link href="/settings" className={CARD_CLS}>
          <div className={SHINE_CLS} />
          <div className="size-12 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/20 flex items-center justify-center shrink-0 group-hover:bg-brand-500/18 group-hover:ring-brand-500/35 transition-all">
            <Settings className="size-5 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">Configurações</p>
            <p className="text-xs text-slate-500 mt-0.5">Dados da oficina</p>
          </div>
          <ChevronRight className={CHEVRON_CLS} />
        </Link>
      </div>
    </div>
  )
}
