"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings } from "lucide-react"
import { UserMenu } from "@/components/layout/UserMenu"

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
  role: string
}

const ALL_NAV = [
  { href: "/dashboard", label: "Dashboard",    icon: LayoutDashboard, roles: null },
  { href: "/settings",  label: "Configurações", icon: Settings,        roles: null },
]

export function DashboardNav({ user, role }: Props) {
  const pathname = usePathname()
  const navItems = ALL_NAV.filter((item) => !item.roles || (item.roles as string[]).includes(role))

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

        <div className="flex-1" />

        <UserMenu user={user} />
      </div>
    </header>
  )
}
