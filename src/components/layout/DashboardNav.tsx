"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, Users } from "lucide-react"
import { UserMenu } from "@/components/layout/UserMenu"

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
  role: string
}

const ALL_NAV = [
  { href: "/dashboard", label: "Dashboard",     icon: LayoutDashboard, roles: null },
  { href: "/customers", label: "Clientes",       icon: Users,           roles: null },
  { href: "/settings",  label: "Configurações",  icon: Settings,        roles: null },
]

export function DashboardNav({ user, role }: Props) {
  const pathname = usePathname()
  const navItems = ALL_NAV.filter((item) => !item.roles || (item.roles as string[]).includes(role))

  return (
    <>
      {/* Top header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="text-xl font-bold gradient-text tracking-tight shrink-0">
            MotorMind
          </Link>

          {/* Nav links — desktop only */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-white/8 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
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

      {/* Bottom nav — mobile only */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.07] bg-slate-950/95 backdrop-blur-md safe-area-bottom">
        <div className="flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 text-[10px] font-medium transition-colors ${
                  active ? "text-brand-400" : "text-slate-500"
                }`}
              >
                <Icon className="size-[22px]" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
