"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Search, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogoUpload } from "@/components/ui/logo-upload"
import { useToast } from "@/components/ui/toaster"
import { workshopSchema, type WorkshopInput } from "@/lib/validations"

// ── Máscaras ─────────────────────────────────────────────────
function maskCNPJ(v: string) {
  return v.replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18)
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trimEnd()
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trimEnd()
}

function maskCEP(v: string) {
  return v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9)
}

interface ViaCEPResult {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

// ── Subcomponentes ─────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 border-b border-white/10 pb-2 w-full block mb-4">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({ label, id, error, children, className }: {
  label: string; id: string; error?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export function WorkshopForm({ onSaved }: { onSaved?: () => void }) {
  const { toast } = useToast()
  const [searchingCEP, setSearchingCEP] = useState(false)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkshopInput>({
    resolver: zodResolver(workshopSchema),
    defaultValues: { country: "Brasil" },
  })

  const logoUrl = watch("logoUrl")
  const zipCode = watch("zipCode")

  useEffect(() => {
    fetch("/api/workshop")
      .then((r) => r.json())
      .then((data) => { if (data) reset(data) })
      .catch(() => {})
  }, [reset])

  async function handleCEPSearch() {
    const cep = (zipCode ?? "").replace(/\D/g, "")
    if (cep.length !== 8) {
      toast({ variant: "error", title: "CEP inválido", description: "Digite um CEP com 8 dígitos." })
      return
    }
    setSearchingCEP(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: ViaCEPResult = await res.json()
      if (data.erro) {
        toast({ variant: "error", title: "CEP não encontrado", description: "Verifique o CEP e tente novamente." })
        return
      }
      setValue("street", data.logradouro, { shouldDirty: true })
      setValue("neighborhood", data.bairro, { shouldDirty: true })
      setValue("city", data.localidade, { shouldDirty: true })
      setValue("state", data.uf, { shouldDirty: true })
      toast({ variant: "success", title: "CEP encontrado!", description: `${data.localidade} / ${data.uf}` })
    } catch {
      toast({ variant: "error", title: "Erro ao buscar CEP", description: "Verifique sua conexão." })
    } finally {
      setSearchingCEP(false)
    }
  }

  async function onSubmit(data: WorkshopInput) {
    const res = await fetch("/api/workshop", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast({ variant: "error", title: "Erro ao salvar", description: err.error ?? "Tente novamente." })
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    toast({ variant: "success", title: "Dados salvos!", description: "Cadastro da oficina atualizado." })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

      {/* Logo centralizado */}
      <div className="flex justify-center pb-2">
        <LogoUpload
          value={logoUrl}
          onChange={(val) => setValue("logoUrl", val, { shouldDirty: true })}
        />
      </div>

      {/* ── Identificação ── */}
      <Section title="Identificação">
        {/* Nome (full width) com autoFocus */}
        <Field label="Nome da Oficina (Razão Social) *" id="name" error={errors.name?.message}>
          <Input
            id="name"
            autoFocus
            placeholder="Ex.: Auto Mecânica Silva Ltda"
            {...register("name")}
          />
        </Field>

        {/* Nome Fantasia | Inscrição Estadual */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome Fantasia" id="tradeName">
            <Input id="tradeName" placeholder="Ex.: Silva Auto Center" {...register("tradeName")} />
          </Field>
          <Field label="Inscrição Estadual" id="stateReg">
            <Input id="stateReg" placeholder="000.000.000.000" {...register("stateReg")} />
          </Field>
        </div>

        {/* CNPJ (metade da largura) */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="CNPJ" id="cnpj">
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              {...register("cnpj")}
              onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value), { shouldDirty: true })}
            />
          </Field>
        </div>
      </Section>

      {/* ── Contato ── */}
      <Section title="Contato">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Telefone" id="phone">
            <Input
              id="phone"
              placeholder="(00) 0000-0000"
              {...register("phone")}
              onChange={(e) => setValue("phone", maskPhone(e.target.value), { shouldDirty: true })}
            />
          </Field>
          <Field label="WhatsApp" id="whatsapp">
            <Input
              id="whatsapp"
              placeholder="(00) 00000-0000"
              {...register("whatsapp")}
              onChange={(e) => setValue("whatsapp", maskPhone(e.target.value), { shouldDirty: true })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="E-mail Comercial" id="email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="contato@oficina.com" {...register("email")} />
          </Field>
          <Field label="Website" id="website">
            <Input id="website" placeholder="https://www.suaoficina.com.br" {...register("website")} />
          </Field>
        </div>
      </Section>

      {/* ── Endereço ── */}
      <Section title="Endereço">
        {/* CEP + Número na mesma linha */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="zipCode">CEP</Label>
            <div className="flex gap-2">
              <Input
                id="zipCode"
                placeholder="00000-000"
                {...register("zipCode")}
                onChange={(e) => setValue("zipCode", maskCEP(e.target.value), { shouldDirty: true })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCEPSearch() } }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCEPSearch}
                disabled={searchingCEP}
                aria-label="Buscar CEP"
                className="shrink-0"
              >
                {searchingCEP ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </Button>
            </div>
          </div>
          <Field label="Número" id="number">
            <Input id="number" placeholder="123" {...register("number")} />
          </Field>
        </div>

        {/* Logradouro | Bairro */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Logradouro" id="street">
            <Input id="street" placeholder="Rua / Av. / Rodovia" {...register("street")} />
          </Field>
          <Field label="Bairro" id="neighborhood">
            <Input id="neighborhood" placeholder="Bairro" {...register("neighborhood")} />
          </Field>
        </div>

        {/* Complemento full width */}
        <Field label="Complemento" id="complement">
          <Input id="complement" placeholder="Sala 2, Galpão A, fundos..." {...register("complement")} />
        </Field>

        {/* Cidade | UF | País */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <Field label="Cidade" id="city">
              <Input id="city" placeholder="Cidade" {...register("city")} />
            </Field>
          </div>
          <Field label="UF" id="state">
            <Input id="state" placeholder="SP" maxLength={2} className="uppercase" {...register("state")} />
          </Field>
          <Field label="País" id="country">
            <Input id="country" placeholder="Brasil" {...register("country")} />
          </Field>
        </div>
      </Section>

      {/* ── Ações ── */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-slate-900 -mx-6 px-6 pb-0">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <><Loader2 className="size-4 animate-spin" /> Salvando...</>
          ) : saved ? (
            <><CheckCircle2 className="size-4 text-emerald-400" /> Salvo!</>
          ) : (
            "Salvar dados"
          )}
        </Button>
        <span className="text-xs text-slate-500">* Campo obrigatório</span>
      </div>
    </form>
  )
}
