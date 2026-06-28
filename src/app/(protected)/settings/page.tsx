import type { Metadata } from "next"
import { WorkshopCard } from "@/components/settings/WorkshopDrawer"

export const metadata: Metadata = { title: "Configurações" }

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-10 relative">
        <div className="pointer-events-none absolute -left-8 -top-8 size-40 bg-brand-500/6 rounded-full blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-1">Sistema</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="mt-1.5 text-slate-400 text-sm">Gerencie as informações do estabelecimento</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Cadastro</p>
        <WorkshopCard />
      </div>
    </div>
  )
}
