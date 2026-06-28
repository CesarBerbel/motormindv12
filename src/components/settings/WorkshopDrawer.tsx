"use client"

import { useState } from "react"
import { Building2, ChevronRight, AlertTriangle } from "lucide-react"
import { Drawer } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { WorkshopForm } from "@/components/settings/WorkshopForm"

export function WorkshopCard() {
  const [open, setOpen] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function openDrawer() {
    setFormDirty(false)
    setConfirming(false)
    setOpen(true)
  }

  function forceClose() {
    setOpen(false)
    setFormDirty(false)
    setConfirming(false)
  }

  function requestClose() {
    if (formDirty) {
      setConfirming(true)
    } else {
      forceClose()
    }
  }

  return (
    <>
      <button
        onClick={openDrawer}
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
        onClose={forceClose}
        onCloseRequest={requestClose}
        title="Dados da Oficina"
        description="Preencha as informações do seu estabelecimento"
        width="max-w-3xl"
      >
        {/* Confirmação de saída sem salvar */}
        {confirming && (
          <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 px-6 py-4 bg-amber-950/95 border-b border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Alterações não salvas</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Se sair agora, as alterações serão perdidas.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setConfirming(false)}
              >
                Continuar editando
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-500 text-white border-0"
                onClick={forceClose}
              >
                Sair sem salvar
              </Button>
            </div>
          </div>
        )}

        <WorkshopForm
          onDirtyChange={setFormDirty}
          onSaved={() => setFormDirty(false)}
        />
      </Drawer>
    </>
  )
}
