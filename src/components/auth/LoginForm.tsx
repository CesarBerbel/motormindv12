"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Loader2, LogIn, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toaster"
import { signInSchema, type SignInInput } from "@/lib/validations"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const resetSuccess = searchParams.get("reset") === "true"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) })

  async function onSubmit(data: SignInInput) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      toast({ variant: "error", title: "Credenciais inválidas", description: "E-mail ou senha incorretos." })
      return
    }

    router.push(searchParams.get("callbackUrl") ?? "/dashboard")
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Shine top */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

        {/* Heading */}
        <div className="mb-7 text-center">
          <p className="text-sm text-slate-400 font-medium">Acesse sua conta</p>
        </div>

        {resetSuccess && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            Senha redefinida com sucesso. Faça login com a nova senha.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="seu@email.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full gap-2 mt-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="size-4 animate-spin" /> Entrando...</>
            ) : (
              <><LogIn className="size-4" /> Entrar</>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
