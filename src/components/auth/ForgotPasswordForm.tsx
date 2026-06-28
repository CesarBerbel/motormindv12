"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    // Sempre mostra sucesso (anti user-enumeration)
    setSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-300">
            MotorMind
          </span>
          <p className="mt-2 text-sm text-slate-400">Recuperação de senha</p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
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
              <h3 className="text-lg font-semibold text-white mb-2">Verifique seu e-mail</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Se o e-mail estiver cadastrado, você receberá as instruções de recuperação em breve.
              </p>
              <Link href="/login" className="mt-6 inline-block">
                <Button variant="outline" className="gap-2 mt-4">
                  <ArrowLeft className="size-4" />
                  Voltar ao login
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <p className="text-sm text-slate-400 mb-4">
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar instruções"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Voltar ao login
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
