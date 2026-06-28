"use client"

import { useState } from "react"
import { Building2, ChevronRight } from "lucide-react"
import { Drawer } from "@/components/ui/drawer"
import { WorkshopForm } from "@/components/settings/WorkshopForm"

export function WorkshopCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full glass rounded-2xl border border-white/10 p-6 text-left hover:border-brand-500/30 hover:bg-white/5 transition-all group flex items-center gap-4"
      >
        <div className="size-12 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0 group-hover:bg-brand-500/25 transition-colors">
          <Building2 className="size-6 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold">Dados da Oficina</p>
          <p className="text-sm text-slate-400 mt-0.5">
            Nome, contato, CNPJ, logo e endereço completo
          </p>
        </div>
        <ChevronRight className="size-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all shrink-0" />
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Dados da Oficina"
        description="Preencha as informações do seu estabelecimento"
        width="max-w-3xl"
      >
        <WorkshopForm onSaved={() => setOpen(false)} />
      </Drawer>
    </>
  )
}
