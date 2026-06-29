"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toaster"
import { RoleBadge } from "@/components/settings/users/RoleBadge"
import {
  updateProfileSchema, changePasswordSchema,
  type UpdateProfileInput, type ChangePasswordInput, type Role,
} from "@/lib/validations"

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trimEnd()
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trimEnd()
}

function initials(name?: string | null, email?: string) {
  return (name ?? email ?? "U")
    .split(/[\s@]/).filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("")
}

interface UserData {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  specialty: string | null
}

export function ProfileForm({ user }: { user: UserData }) {
  const { toast } = useToast()
  const router = useRouter()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── Info form ──
  const {
    register: regInfo, handleSubmit: submitInfo, setValue: setVal,
    formState: { isSubmitting: savingInfo, isDirty: infoDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name ?? "", phone: user.phone ?? "" },
  })

  async function saveInfo(data: UpdateProfileInput) {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast({ variant: "error", title: "Erro ao salvar", description: err.error })
      return
    }
    toast({ variant: "success", title: "Perfil atualizado!" })
    router.refresh()
  }

  // ── Password form ──
  const {
    register: regPwd, handleSubmit: submitPwd, reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: savingPwd },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function changePassword(data: ChangePasswordInput) {
    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast({ variant: "error", title: "Erro ao alterar senha", description: err.error })
      return
    }
    toast({ variant: "success", title: "Senha alterada!", description: "Você será desconectado agora." })
    resetPwd()
    // Aguarda o toast aparecer e então faz logout
    setTimeout(() => { window.location.href = "/login" }, 1500)
  }

  return (
    <div className="space-y-8">

      {/* Avatar + identidade */}
      <div className="flex items-center gap-5">
        <div className="size-20 rounded-full bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-brand-300">
            {initials(user.name, user.email)}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-white">{user.name ?? "—"}</h2>
            <RoleBadge role={user.role as Role} />
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
          {user.specialty && (
            <p className="text-xs text-amber-400/70 mt-0.5">{user.specialty}</p>
          )}
        </div>
      </div>

      {/* Informações */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Informações pessoais</h3>
        <form onSubmit={submitInfo(saveInfo)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" {...regInfo("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                {...regInfo("phone")}
                onChange={(e) => setVal("phone", maskPhone(e.target.value), { shouldDirty: true })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={savingInfo || !infoDirty} className="gap-2">
              {savingInfo
                ? <><Loader2 className="size-4 animate-spin" /> Salvando...</>
                : <><CheckCircle2 className="size-4" /> Salvar</>
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Segurança / Senha */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Segurança</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Após alterar a senha você será desconectado e precisará fazer login novamente.
          </p>
        </div>
        <form onSubmit={submitPwd(changePassword)} noValidate className="space-y-4">
          {/* Senha atual */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pr-10"
                {...regPwd("currentPassword")}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {pwdErrors.currentPassword && <p className="text-xs text-red-400">{pwdErrors.currentPassword.message}</p>}
          </div>

          {/* Nova senha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...regPwd("newPassword")}
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {pwdErrors.newPassword && <p className="text-xs text-red-400">{pwdErrors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...regPwd("confirmPassword")}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {pwdErrors.confirmPassword && <p className="text-xs text-red-400">{pwdErrors.confirmPassword.message}</p>}
            </div>
          </div>

          <p className="text-xs text-slate-500">Mínimo 8 caracteres com maiúscula, número e caractere especial.</p>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={savingPwd} className="gap-2">
              {savingPwd
                ? <><Loader2 className="size-4 animate-spin" /> Alterando...</>
                : "Alterar senha"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
