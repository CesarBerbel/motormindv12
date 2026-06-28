"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { LogOut, LayoutDashboard, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function DashboardNav({ user }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xl font-bold gradient-text">
            MotorMind
          </Link>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <LayoutDashboard className="size-3.5" />
            Dashboard
          </div>
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="size-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <User className="size-3.5 text-brand-400" />
            </div>
            <span className="text-slate-300">{user.name ?? user.email}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
