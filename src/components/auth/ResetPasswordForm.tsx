"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? "" },
  })

  // Token ausente na URL
  if (!token) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <div className="size-16 rounded-full bg-red-500/15 flex items-center justify-center">
            <AlertCircle className="size-8 text-red-400" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Link inválido</h2>
        <p className="text-slate-400 text-sm mb-6">
          Este link de redefinição é inválido ou já foi utilizado. Solicite um novo.
        </p>
        <Link href="/forgot-password">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Solicitar novo link
          </Button>
        </Link>
      </div>
    )
  }

  async function onSubmit(data: ResetPasswordInput) {
    setStatus("idle")
    setErrorMessage("")

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      setStatus("error")
      setErrorMessage(json.message ?? "Erro ao redefinir senha.")
      return
    }

    setStatus("success")
    setTimeout(() => router.push("/login?reset=true"), 2500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-300">
            MotorMind
          </span>
          <p className="mt-2 text-sm text-slate-400">Criar nova senha</p>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="size-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="size-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Senha redefinida!</h3>
              <p className="text-slate-400 text-sm">Redirecionando para o login...</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              {/* Token oculto */}
              <input type="hidden" {...register("token")} />

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Nova senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showConfirm ? "Ocultar" : "Mostrar"}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="size-4 animate-spin" /> Salvando...</>
                ) : (
                  "Salvar nova senha"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="size-3.5" /> Voltar ao login
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
