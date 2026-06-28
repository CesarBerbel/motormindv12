"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Zap, Shield, BarChart3, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Zap,
    title: "Alta Performance",
    description: "Processamento em tempo real com latência mínima para decisões críticas.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Criptografia end-to-end, autenticação multifator e auditoria completa.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Inteligência de Dados",
    description: "Dashboards interativos com insights acionáveis para seu negócio.",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    ring: "ring-brand-500/20",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text tracking-tight">MotorMind</span>
          <Link href="/login">
            <Button size="sm" className="bg-brand-500 hover:bg-brand-400 text-white gap-2 shadow-lg shadow-brand-500/20">
              Entrar <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-brand-600/14 blur-[100px]" />
          <div className="absolute bottom-0 right-0 size-[500px] rounded-full bg-brand-900/30 blur-[80px]" />
          <div className="absolute bottom-0 left-0 size-[300px] rounded-full bg-slate-800/50 blur-[60px]" />
        </div>
        {/* Dot grid overlay */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-100" />
        {/* Radial fade mask over grid */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, #020617 100%)" }} />

        <motion.div initial="hidden" animate="visible" className="relative z-10 max-w-4xl">
          <motion.div custom={0} variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-500/8 px-4 py-1.5 text-xs font-medium text-brand-300 mb-8 tracking-wide uppercase">
              <span className="size-1.5 rounded-full bg-brand-400 animate-pulse" />
              Plataforma de próxima geração
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Inteligência que
            <br />
            <span className="gradient-text">move seu negócio</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            MotorMind combina análise de dados avançada com automação inteligente
            para transformar a forma como você toma decisões.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 bg-brand-500 hover:bg-brand-400 text-white px-8 text-base font-semibold shadow-xl shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:-translate-y-0.5"
              >
                Acessar plataforma
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 text-slate-300 hover:bg-white/8 hover:text-white px-8 text-base"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Saiba mais
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ delay: 2, duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          className="absolute bottom-10"
        >
          <ChevronDown className="size-5 text-slate-500" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-32 px-6">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
        <div className="mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-4">Funcionalidades</p>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Tudo que você precisa,{" "}
              <span className="gradient-text">em um lugar</span>
            </h2>
            <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
              Ferramentas poderosas construídas para escalar com o seu negócio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-8 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden"
              >
                {/* Shine top */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className={`mb-5 inline-flex size-12 items-center justify-center rounded-xl ${f.bg} ring-1 ${f.ring} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`size-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center relative rounded-3xl border border-brand-500/20 bg-gradient-to-b from-brand-500/8 to-transparent p-16 overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 size-64 rounded-full bg-brand-500/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Pronto para começar?</h2>
            <p className="text-slate-400 mb-8 text-base">
              Acesse sua conta e comece a transformar dados em decisões.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-brand-500 hover:bg-brand-400 text-white gap-2 px-8 font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all"
              >
                Entrar agora <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] py-8 px-6 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} MotorMind. Todos os direitos reservados.
      </footer>
    </div>
  )
}
