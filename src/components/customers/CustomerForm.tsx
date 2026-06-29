"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toaster"
import { customerSchema, type CustomerInput } from "@/lib/validations"

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "")
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "")
}

function maskDocument(v: string) {
  const d = v.replace(/\D/g, "")
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14)
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18)
}

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8)
  return d.replace(/^(\d{5})(\d{1,3})/, "$1-$2")
}

interface Customer {
  id: string
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  birthDate?: string | null
  notes?: string | null
  zipCode?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
}

interface Props {
  customer?: Customer | null
  onDirtyChange: (dirty: boolean) => void
  onSaved: (customer: Customer) => void
}

export function CustomerForm({ customer, onDirtyChange, onSaved }: Props) {
  const { toast } = useToast()
  const [cepLoading, setCepLoading] = useState(false)

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name:         customer?.name         ?? "",
      document:     customer?.document     ?? "",
      email:        customer?.email        ?? "",
      phone:        customer?.phone        ?? "",
      whatsapp:     customer?.whatsapp     ?? "",
      birthDate:    customer?.birthDate    ?? "",
      notes:        customer?.notes        ?? "",
      zipCode:      customer?.zipCode      ?? "",
      street:       customer?.street       ?? "",
      number:       customer?.number       ?? "",
      complement:   customer?.complement   ?? "",
      neighborhood: customer?.neighborhood ?? "",
      city:         customer?.city         ?? "",
      state:        customer?.state        ?? "",
    },
  })

  useEffect(() => { onDirtyChange(isDirty) }, [isDirty, onDirtyChange])

  async function searchCep() {
    const cep = watch("zipCode")?.replace(/\D/g, "") ?? ""
    if (cep.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setValue("street",       data.logradouro, { shouldDirty: true })
        setValue("neighborhood", data.bairro,     { shouldDirty: true })
        setValue("city",         data.localidade, { shouldDirty: true })
        setValue("state",        data.uf,         { shouldDirty: true })
      } else {
        toast({ variant: "error", title: "CEP não encontrado" })
      }
    } catch {
      toast({ variant: "error", title: "Erro ao buscar CEP" })
    } finally {
      setCepLoading(false)
    }
  }

  async function onSubmit(data: CustomerInput) {
    const url    = customer ? `/api/customers/${customer.id}` : "/api/customers"
    const method = customer ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast({ variant: "error", title: "Erro ao salvar", description: err.error })
      return
    }
    const saved = await res.json()
    toast({ variant: "success", title: customer ? "Cliente atualizado!" : "Cliente criado!" })
    onSaved(saved)
  }

  const fieldCls = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition"

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Identificação */}
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Identificação</p>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" autoFocus placeholder="Nome completo" {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="document">CPF / CNPJ</Label>
              <Input
                id="document"
                placeholder="000.000.000-00"
                {...register("document")}
                onChange={(e) => setValue("document", maskDocument(e.target.value), { shouldDirty: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Contato</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                {...register("phone")}
                onChange={(e) => setValue("phone", maskPhone(e.target.value), { shouldDirty: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="(00) 00000-0000"
                {...register("whatsapp")}
                onChange={(e) => setValue("whatsapp", maskPhone(e.target.value), { shouldDirty: true })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="cliente@email.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
        </section>

        {/* Endereço */}
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Endereço</p>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                placeholder="00000-000"
                {...register("zipCode")}
                onChange={(e) => {
                  const masked = maskCep(e.target.value)
                  setValue("zipCode", masked, { shouldDirty: true })
                  if (masked.replace(/\D/g, "").length === 8) {
                    setTimeout(searchCep, 0)
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={searchCep}
              disabled={cepLoading}
              className="shrink-0"
              title="Buscar CEP"
            >
              {cepLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            </Button>
            <div className="space-y-1.5">
              <Label htmlFor="number">Número</Label>
              <Input id="number" placeholder="000" className="w-24" {...register("number")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="street">Logradouro</Label>
              <Input id="street" placeholder="Rua, Av..." {...register("street")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" placeholder="Bairro" {...register("neighborhood")} />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" placeholder="Apto, sala..." {...register("complement")} />
            </div>
            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" placeholder="Cidade" {...register("city")} />
            </div>
            <div className="space-y-1.5 w-20">
              <Label htmlFor="state">UF</Label>
              <Input id="state" placeholder="SP" maxLength={2} className="uppercase" {...register("state")} />
            </div>
          </div>
        </section>

        {/* Observações */}
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Observações</p>
          <textarea
            rows={3}
            placeholder="Informações adicionais sobre o cliente..."
            className={fieldCls + " resize-none"}
            {...register("notes")}
          />
        </section>

      </div>

      {/* Sticky footer */}
      <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8 bg-[#0e1117]">
        <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
          {isSubmitting
            ? <><Loader2 className="size-4 animate-spin" /> Salvando...</>
            : customer ? "Salvar alterações" : "Criar cliente"
          }
        </Button>
      </div>
    </form>
  )
}
