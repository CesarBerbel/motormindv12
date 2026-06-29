"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { User, LogOut, ChevronDown } from "lucide-react"

interface Props {
  user: { name?: string | null; email?: string | null }
}

function initials(name?: string | null, email?: string | null) {
  return (name ?? email ?? "U")
    .split(/[\s@]/).filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("")
}

export function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onEscape)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/8 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="size-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-brand-300">{initials(user.name, user.email)}</span>
        </div>
        <span className="hidden sm:block text-sm text-slate-300 max-w-[130px] truncate">
          {user.name ?? user.email}
        </span>
        <ChevronDown className={`size-3.5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/8">
              <p className="text-sm font-semibold text-white truncate">{user.name ?? "—"}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>

            {/* Links */}
            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="size-4" />
                Meu perfil
              </Link>
            </div>

            {/* Sair */}
            <div className="border-t border-white/8 py-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
