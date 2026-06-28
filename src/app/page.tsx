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
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Criptografia end-to-end, autenticação multifator e auditoria completa.",
  },
  {
    icon: BarChart3,
    title: "Inteligência de Dados",
    description: "Dashboards interativos com insights acionáveis para seu negócio.",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">MotorMind</span>
          <Link href="/login">
            <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
              Entrar <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-32 right-0 size-[500px] rounded-full bg-brand-800/30 blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl"
        >
          <motion.div custom={0} variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-8">
              <Zap className="size-3.5" />
              Plataforma de próxima geração
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            Inteligência que
            <br />
            <span className="gradient-text">move seu negócio</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            MotorMind combina análise de dados avançada com automação inteligente
            para transformar a forma como você toma decisões.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 bg-brand-500 hover:bg-brand-400 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:-translate-y-0.5"
              >
                Acessar plataforma
                <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Saiba mais
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="absolute bottom-10"
        >
          <ChevronDown className="size-6 text-slate-500" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa,{" "}
              <span className="gradient-text">em um lugar</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Ferramentas poderosas construídas para escalar com o seu negócio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="group glass rounded-2xl p-8 hover:border-brand-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-brand-500/30 group-hover:bg-brand-500/25 transition-colors">
                  <f.icon className="size-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center glass rounded-3xl p-16 border border-brand-500/20"
        >
          <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Acesse sua conta e comece a transformar dados em decisões.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-brand-500 hover:bg-brand-400 text-white gap-2 px-10 py-6 text-base font-semibold"
            >
              Entrar agora <ArrowRight className="size-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} MotorMind. Todos os direitos reservados.
      </footer>
    </div>
  )
}
