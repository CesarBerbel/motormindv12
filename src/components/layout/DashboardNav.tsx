"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LogOut, LayoutDashboard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
  role: string
}

const ALL_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { href: "/settings",  label: "Configurações", icon: Settings,      roles: null },
]

function Initials({ name, email }: { name?: string | null; email?: string | null }) {
  const src = name ?? email ?? "U"
  const initials = src
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
  return (
    <div className="size-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-brand-300">{initials}</span>
    </div>
  )
}

export function DashboardNav({ user, role }: Props) {
  const pathname = usePathname()
  const navItems = ALL_NAV.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold gradient-text tracking-tight shrink-0">
          MotorMind
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/8 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <Initials name={user.name} email={user.email} />
            <span className="text-sm text-slate-300 max-w-[140px] truncate">
              {user.name ?? user.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-400 hover:text-white hover:bg-white/8 px-3"
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
