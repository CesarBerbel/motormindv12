"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toaster"
import {
  createUserSchema, updateUserSchema,
  type CreateUserInput, type UpdateUserInput, type Role,
} from "@/lib/validations"
import { maskPhone } from "@/lib/masks"

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "MANAGER",   label: "Gerente" },
  { value: "ATTENDANT", label: "Atendente" },
  { value: "MECHANIC",  label: "Mecânico" },
  { value: "ADMIN",     label: "Administrador" },
]

const SPECIALTIES = [
  "Mecânico Geral", "Eletricista Automotivo", "Funileiro",
  "Pintor Automotivo", "Borracheiro", "Ar-condicionado",
  "Injeção Eletrônica", "Cambista", "Vidraceiro",
]

export type UserFormData = {
  id: string; name: string | null; email: string
  role: Role; specialty: string | null; phone: string | null; active: boolean
}

interface Props {
  user?: UserFormData
  currentUserRole: string
  currentUserId: string
  onSaved: () => void
  onDirtyChange?: (dirty: boolean) => void
}

export function UserForm({ user, currentUserRole, currentUserId, onSaved, onDirtyChange }: Props) {
  const { toast } = useToast()
  const isEdit = !!user
  const isSelf = user?.id === currentUserId
  const [showPassword, setShowPassword] = useState(false)

  const schema = isEdit ? updateUserSchema : createUserSchema
  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateUserInput & UpdateUserInput>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? { name: user.name ?? "", email: user.email, phone: user.phone ?? "", role: user.role, specialty: user.specialty ?? "", active: user.active, password: "" }
      : { role: "ATTENDANT", active: true },
  })

  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  const watchRole = watch("role")

  async function onSubmit(data: CreateUserInput & UpdateUserInput) {
    const body = { ...data }
    if (isEdit && !data.password) delete body.password

    const res = await fetch(isEdit ? `/api/users/${user!.id}` : "/api/users", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast({ variant: "error", title: "Erro ao salvar", description: err.error ?? "Tente novamente." })
      return
    }

    reset()
    toast({ variant: "success", title: isEdit ? "Usuário atualizado!" : "Usuário criado!", description: data.name })
    onSaved()
  }

  const canChangeRole = !isSelf && !(currentUserRole === "MANAGER")
  const availableRoles = currentUserRole === "ADMIN"
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r.value !== "ADMIN")

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Nome + E-mail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo *</Label>
          <Input id="name" autoFocus placeholder="Ex.: João Silva" {...register("name")} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" type="email" placeholder="joao@oficina.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
      </div>

      {/* Telefone + Função */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone" placeholder="(00) 00000-0000"
            {...register("phone")}
            onChange={(e) => setValue("phone", maskPhone(e.target.value), { shouldDirty: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Função *</Label>
          <select
            id="role"
            disabled={!canChangeRole}
            {...register("role")}
            className="flex h-10 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {availableRoles.map((r) => (
              <option key={r.value} value={r.value} className="bg-slate-800">{r.label}</option>
            ))}
          </select>
          {isSelf && <p className="text-xs text-slate-500">Não é possível alterar a própria função</p>}
        </div>
      </div>

      {/* Especialidade (só para Mecânico) */}
      {watchRole === "MECHANIC" && (
        <div className="space-y-1.5">
          <Label htmlFor="specialty">Especialidade</Label>
          <Input
            id="specialty"
            list="specialties-list"
            placeholder="Ex.: Eletricista Automotivo"
            {...register("specialty")}
          />
          <datalist id="specialties-list">
            {SPECIALTIES.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
      )}

      {/* Status ativo (só no edit) */}
      {isEdit && (
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            disabled={isSelf}
            onClick={() => setValue("active", !watch("active"), { shouldDirty: true })}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed ${watch("active") ? "bg-brand-500" : "bg-slate-700"}`}
          >
            <span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg transition-transform ${watch("active") ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <Label className="cursor-pointer select-none">
            {watch("active") ? "Usuário ativo" : "Usuário inativo"}
          </Label>
          {isSelf && <span className="text-xs text-slate-500">(não é possível desativar a si mesmo)</span>}
        </div>
      )}

      {/* Senha */}
      <div className="space-y-1.5 pt-2 border-t border-white/8">
        <Label htmlFor="password">
          {isEdit ? "Nova senha (deixe em branco para manter)" : "Senha *"}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isEdit ? "new-password" : "new-password"}
            placeholder="••••••••"
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        {!isEdit && (
          <p className="text-xs text-slate-500">Mínimo 8 caracteres, maiúscula, número e caractere especial</p>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/8 sticky bottom-0 bg-slate-900 -mx-6 px-6 pb-0">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting
            ? <><Loader2 className="size-4 animate-spin" /> Salvando...</>
            : <><CheckCircle2 className="size-4" /> {isEdit ? "Salvar alterações" : "Criar usuário"}</>
          }
        </Button>
        <span className="text-xs text-slate-500">* Campo obrigatório</span>
      </div>
    </form>
  )
}
