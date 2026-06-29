import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Users } from "lucide-react"
import { auth } from "@/auth"
import { WorkshopCard } from "@/components/settings/WorkshopDrawer"

export const metadata: Metadata = { title: "Configurações" }

const CAN_MANAGE = ["ADMIN", "MANAGER"]

export default async function SettingsPage() {
  const session = await auth()
  const role = session?.user?.role as string
  const canManage = CAN_MANAGE.includes(role)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-10 relative">
        <div className="pointer-events-none absolute -left-8 -top-8 size-40 bg-brand-500/6 rounded-full blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-1">Sistema</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="mt-1.5 text-slate-400 text-sm">Gerencie as informações do estabelecimento</p>
      </div>

      {canManage ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Cadastro</p>
            <WorkshopCard />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Equipe</p>
            <Link
              href="/settings/users"
              className="group relative w-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 flex items-center gap-4 hover:border-brand-500/25 hover:bg-white/[0.06] transition-all duration-200 overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent group-hover:via-brand-400/30 transition-all" />
              <div className="size-12 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/20 flex items-center justify-center shrink-0 group-hover:bg-brand-500/18 group-hover:ring-brand-500/35 transition-all">
                <Users className="size-5 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">Usuários e Permissões</p>
                <p className="text-sm text-slate-400 mt-0.5">Gerentes, atendentes, mecânicos e acessos</p>
              </div>
              <ChevronRight className="size-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-10 text-center">
          <p className="text-slate-400 text-sm">
            Não há configurações disponíveis para o seu perfil.
          </p>
        </div>
      )}
    </div>
  )
}
