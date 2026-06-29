import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronLeft, Users } from "lucide-react"
import { auth } from "@/auth"
import { UsersManager } from "@/components/settings/users/UsersManager"

export const metadata: Metadata = { title: "Usuários e Permissões" }

export default async function UsersPage() {
  const session = await auth()
  const role = session?.user?.role as string

  if (!["ADMIN", "MANAGER"].includes(role)) redirect("/settings")

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Breadcrumb */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ChevronLeft className="size-4" />
        Configurações
      </Link>

      {/* Header */}
      <div className="mb-8 relative">
        <div className="pointer-events-none absolute -left-8 -top-8 size-40 bg-brand-500/6 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 mb-1">
          <div className="size-9 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/20 flex items-center justify-center">
            <Users className="size-4 text-brand-400" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Equipe</p>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Usuários e Permissões</h1>
        <p className="mt-1.5 text-slate-400 text-sm">
          Gerencie os membros da equipe, funções e acessos ao sistema.
        </p>
      </div>

      <UsersManager
        currentUserId={session!.user.id as string}
        currentUserRole={role}
      />
    </div>
  )
}
