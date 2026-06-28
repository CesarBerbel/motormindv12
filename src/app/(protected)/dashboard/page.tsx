import type { Metadata } from "next"
import { auth } from "@/auth"
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

const stats = [
  { label: "Usuários Ativos", value: "1.284", change: "+12%", icon: Users, color: "text-brand-400" },
  { label: "Receita Mensal", value: "R$ 48.2k", change: "+8.1%", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Análises", value: "9.431", change: "+23%", icon: BarChart3, color: "text-purple-400" },
  { label: "Uptime", value: "99.9%", change: "SLA", icon: Activity, color: "text-orange-400" },
]

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Olá, {session?.user?.name?.split(" ")[0] ?? "Admin"} 👋
        </h1>
        <p className="mt-1 text-slate-400">
          Bem-vindo ao painel de controle MotorMind.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-6 border border-white/10 hover:border-brand-500/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-slate-400 text-sm">{stat.label}</span>
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-sm text-emerald-400 mb-0.5">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder gráfico */}
      <div className="glass rounded-2xl p-8 border border-white/10 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Visão Geral</h2>
        <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
          <p className="text-slate-500 text-sm">Gráficos serão exibidos aqui</p>
        </div>
      </div>

      {/* Atividade recente */}
      <div className="glass rounded-2xl p-8 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-6">Atividade Recente</h2>
        <div className="space-y-4">
          {[
            { action: "Login realizado", time: "agora mesmo", user: session?.user?.email },
            { action: "Sistema iniciado", time: "há 2 minutos", user: "sistema" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="size-2 rounded-full bg-brand-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{item.action}</p>
                <p className="text-xs text-slate-500 truncate">{item.user}</p>
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
