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
  if (d.length <= 10)
    return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim()
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim()
}

function maskCEP(v: string) {
  return v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9)
}

// ── Tipo retorno ViaCEP ───────────────────────────────────────
interface ViaCEPResult {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

// ── Seção do formulário ───────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 block">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
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

  // Carregar dados existentes
  useEffect(() => {
    fetch("/api/workshop")
      .then((r) => r.json())
      .then((data) => { if (data) reset(data) })
      .catch(() => {})
  }, [reset])

  // Buscar CEP
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
      toast({ variant: "error", title: "Erro ao buscar CEP", description: "Verifique sua conexão e tente novamente." })
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

      {/* Logo */}
      <div className="flex justify-center">
        <LogoUpload
          value={logoUrl}
          onChange={(val) => setValue("logoUrl", val, { shouldDirty: true })}
        />
      </div>

      {/* Identificação */}
      <Section title="Identificação">
        <Field label="Nome da Oficina (Razão Social) *" id="name" error={errors.name?.message}>
          <Input id="name" placeholder="Ex.: Auto Mecânica Silva Ltda" {...register("name")} />
        </Field>
        <Field label="Nome Fantasia" id="tradeName">
          <Input id="tradeName" placeholder="Ex.: Silva Auto Center" {...register("tradeName")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="CNPJ" id="cnpj">
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              {...register("cnpj")}
              onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value), { shouldDirty: true })}
            />
          </Field>
          <Field label="Inscrição Estadual" id="stateReg">
            <Input id="stateReg" placeholder="000.000.000.000" {...register("stateReg")} />
          </Field>
        </div>
      </Section>

      {/* Contato */}
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
        <Field label="E-mail Comercial" id="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="contato@oficina.com" {...register("email")} />
        </Field>
        <Field label="Website" id="website">
          <Input id="website" placeholder="https://www.suaoficina.com.br" {...register("website")} />
        </Field>
      </Section>

      {/* Endereço */}
      <Section title="Endereço">
        {/* CEP */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              placeholder="00000-000"
              {...register("zipCode")}
              onChange={(e) => setValue("zipCode", maskCEP(e.target.value), { shouldDirty: true })}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCEPSearch() } }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2 shrink-0"
            onClick={handleCEPSearch}
            disabled={searchingCEP}
          >
            {searchingCEP ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            Buscar
          </Button>
        </div>

        <Field label="Logradouro" id="street">
          <Input id="street" placeholder="Rua / Av. / Rodovia" {...register("street")} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Número" id="number">
            <Input id="number" placeholder="123" {...register("number")} />
          </Field>
          <div className="col-span-2">
            <Field label="Complemento" id="complement">
              <Input id="complement" placeholder="Sala 2, Galpão A..." {...register("complement")} />
            </Field>
          </div>
        </div>

        <Field label="Bairro" id="neighborhood">
          <Input id="neighborhood" placeholder="Bairro" {...register("neighborhood")} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="Cidade" id="city">
              <Input id="city" placeholder="Cidade" {...register("city")} />
            </Field>
          </div>
          <Field label="Estado (UF)" id="state">
            <Input id="state" placeholder="SP" maxLength={2} className="uppercase" {...register("state")} />
          </Field>
        </div>

        <Field label="País" id="country">
          <Input id="country" placeholder="Brasil" {...register("country")} />
        </Field>
      </Section>

      {/* Ações */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
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
