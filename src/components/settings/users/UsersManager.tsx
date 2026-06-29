"use client"

import { useEffect, useState, useCallback } from "react"
import { UserPlus, Pencil, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { useToast } from "@/components/ui/toaster"
import { RoleBadge } from "./RoleBadge"
import { UserForm, type UserFormData } from "./UserForm"
import type { Role } from "@/lib/validations"

type UserRow = UserFormData & { createdAt: string }

const FILTERS: { key: string; label: string }[] = [
  { key: "ALL",       label: "Todos" },
  { key: "MANAGER",   label: "Gerentes" },
  { key: "ATTENDANT", label: "Atendentes" },
  { key: "MECHANIC",  label: "Mecânicos" },
]

function initials(name: string | null, email: string) {
  const src = name ?? email
  return src.split(/[\s@]/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
}

interface Props {
  currentUserId: string
  currentUserRole: string
}

export function UsersManager({ currentUserId, currentUserRole }: Props) {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [formDirty, setFormDirty] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      if (res.ok) setUsers(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function openCreate() {
    setEditingUser(null); setFormDirty(false); setConfirming(false); setDrawerOpen(true)
  }
  function openEdit(user: UserRow) {
    setEditingUser(user); setFormDirty(false); setConfirming(false); setDrawerOpen(true)
  }
  function forceClose() {
    setDrawerOpen(false); setEditingUser(null); setFormDirty(false); setConfirming(false)
  }
  function requestClose() {
    if (formDirty) setConfirming(true); else forceClose()
  }
  function handleSaved() { fetchUsers(); forceClose() }

  async function handleToggle(user: UserRow) {
    if (user.id === currentUserId) return
    const prev = user.active
    setUsers((u) => u.map((x) => x.id === user.id ? { ...x, active: !prev } : x))
    const res = await fetch(`/api/users/${user.id}`, { method: "PATCH" })
    if (!res.ok) {
      setUsers((u) => u.map((x) => x.id === user.id ? { ...x, active: prev } : x))
      toast({ variant: "error", title: "Erro ao alterar status" })
    }
  }

  const canEdit = (u: UserRow) =>
    currentUserRole === "ADMIN" || (currentUserRole === "MANAGER" && u.role !== "ADMIN")

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter)
  const counts: Record<string, number> = { ALL: users.length }
  for (const u of users) counts[u.role] = (counts[u.role] ?? 0) + 1

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {label}
              {counts[key] !== undefined && (
                <span className="ml-1.5 opacity-60">{counts[key]}</span>
              )}
            </button>
          ))}
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2 shrink-0">
          <UserPlus className="size-4" />
          Novo usuário
        </Button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const isSelf = user.id === currentUserId
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all"
              >
                {/* Avatar */}
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${
                  isSelf ? "bg-brand-500/20 text-brand-300" : "bg-slate-700/80 text-slate-300"
                }`}>
                  {initials(user.name, user.email)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">
                      {user.name ?? "—"}
                    </span>
                    {isSelf && <span className="text-xs text-slate-500 shrink-0">(você)</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  {/* Badge + specialty — visible on mobile, hidden on sm (badge moves to main row) */}
                  <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                    <RoleBadge role={user.role as Role} />
                    {user.specialty && (
                      <p className="text-xs text-amber-400/70 truncate">{user.specialty}</p>
                    )}
                  </div>
                  {user.specialty && (
                    <p className="hidden sm:block text-xs text-amber-400/70">{user.specialty}</p>
                  )}
                </div>

                {/* Role — desktop only */}
                <div className="hidden sm:block">
                  <RoleBadge role={user.role as Role} />
                </div>

                {/* Toggle ativo */}
                <button
                  onClick={() => handleToggle(user)}
                  disabled={isSelf}
                  title={isSelf ? "Não é possível alterar o próprio status" : user.active ? "Desativar" : "Ativar"}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    user.active
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : "text-slate-500 hover:bg-slate-700/50"
                  }`}
                >
                  <span className={`size-2 rounded-full shrink-0 ${user.active ? "bg-emerald-400" : "bg-slate-600"}`} />
                  <span className="hidden sm:inline">{user.active ? "Ativo" : "Inativo"}</span>
                </button>

                {/* Editar */}
                {canEdit(user) ? (
                  <button
                    onClick={() => openEdit(user)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="size-4" />
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={forceClose}
        onCloseRequest={requestClose}
        title={editingUser ? "Editar Usuário" : "Novo Usuário"}
        description={editingUser ? editingUser.name ?? editingUser.email : "Preencha os dados do novo membro"}
      >
        {confirming && (
          <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 px-6 py-4 bg-amber-950/95 border-b border-amber-500/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Alterações não salvas</p>
                <p className="text-xs text-slate-300 mt-0.5">Se sair agora, as alterações serão perdidas.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                Continuar editando
              </Button>
              <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-500 text-white border-0" onClick={forceClose}>
                Sair sem salvar
              </Button>
            </div>
          </div>
        )}
        <UserForm
          key={editingUser?.id ?? "new"}
          user={editingUser ?? undefined}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          onSaved={handleSaved}
          onDirtyChange={setFormDirty}
        />
      </Drawer>
    </>
  )
}
