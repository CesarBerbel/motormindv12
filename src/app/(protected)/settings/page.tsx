import type { Metadata } from "next"
import { Settings } from "lucide-react"
import { WorkshopCard } from "@/components/settings/WorkshopDrawer"

export const metadata: Metadata = { title: "Configurações" }

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-10 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center">
          <Settings className="size-5 text-slate-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie as informações do sistema</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Cadastro</p>
        <WorkshopCard />
      </div>
    </div>
  )
}
