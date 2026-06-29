"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Plus, Search, Pencil, Users, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Drawer } from "@/components/ui/drawer"
import { CustomerForm } from "./CustomerForm"

interface Customer {
  id: string
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  birthDate?: string | null
  notes?: string | null
  zipCode?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  createdAt: string
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
}

function formatPhone(v: string | null | undefined) {
  if (!v) return null
  const d = v.replace(/\D/g, "")
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return v
}

function PhoneLink({ number }: { number: string }) {
  const digits = number.replace(/\D/g, "")
  return (
    <a
      href={`tel:+55${digits}`}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
    >
      <Phone className="size-3 shrink-0" />
      {formatPhone(number)}
    </a>
  )
}

function highlight(text: string, q: string) {
  if (!q.trim()) return <>{text}</>
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${esc})`, "gi"))
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase()
          ? <mark key={i} className="bg-brand-500/25 text-brand-200 rounded-sm not-italic">{p}</mark>
          : p
      )}
    </>
  )
}

function WhatsAppMenu({ number }: { number: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const digits = number.replace(/\D/g, "")

  useEffect(() => {
    if (!open) return
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onMouse)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onMouse)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <MessageCircle className="size-3 shrink-0" />
        {formatPhone(number)}
      </button>

      <div
        className={[
          "absolute left-0 top-full mt-1.5 z-50 min-w-[170px] rounded-xl border border-white/10",
          "bg-slate-900/95 backdrop-blur-sm shadow-xl shadow-black/50 overflow-hidden",
          "transition-all duration-100 origin-top-left",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <a
          href={`tel:+55${digits}`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/6 hover:text-white transition-colors"
        >
          <Phone className="size-3.5 text-slate-500" />
          Ligar
        </a>
        <div className="h-px bg-white/6 mx-2" />
        <a
          href={`https://wa.me/55${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/6 hover:text-white transition-colors"
        >
          <MessageCircle className="size-3.5 text-emerald-500" />
          Mandar mensagem
        </a>
      </div>
    </div>
  )
}

export function CustomersManager() {
  const [customers,      setCustomers]      = useState<Customer[]>([])
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState("")
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formDirty,      setFormDirty]      = useState(false)
  const [confirming,     setConfirming]     = useState(false)
  const [acOpen,         setAcOpen]         = useState(false)
  const [acIndex,        setAcIndex]        = useState(-1)
  const searchRef  = useRef<HTMLDivElement>(null)
  // Sempre atualizado no render; lido pelo listener de keydown sem stale closure
  const acStateRef = useRef<{ acOpen: boolean; acIndex: number; filtered: Customer[] }>({
    acOpen: false, acIndex: -1, filtered: [],
  })

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/customers")
      if (res.ok) setCustomers(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  // Fecha ao clicar fora
  useEffect(() => {
    if (!acOpen) return
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setAcOpen(false)
        setAcIndex(-1)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [acOpen])

  // Navegação por teclado — listener global com deps vazias lê do ref (sem stale closure)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const { acOpen, acIndex, filtered } = acStateRef.current
      if (!acOpen || !filtered.length) return
      const sug = filtered.slice(0, 8)

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setAcIndex((i) => Math.min(i + 1, sug.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setAcIndex((i) => Math.max(i - 1, -1))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const target = acIndex >= 0 ? sug[acIndex] : sug.length === 1 ? sug[0] : null
        if (target) {
          setAcOpen(false)
          setAcIndex(-1)
          setEditingCustomer(target)
          setFormDirty(false)
          setConfirming(false)
          setDrawerOpen(true)
        }
      } else if (e.key === "Escape") {
        setAcOpen(false)
        setAcIndex(-1)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, []) // vazio: setters do useState são estáveis; valores lidos do ref

  function openNew() {
    setEditingCustomer(null)
    setFormDirty(false)
    setConfirming(false)
    setDrawerOpen(true)
  }

  function openEdit(c: Customer) {
    setEditingCustomer(c)
    setFormDirty(false)
    setConfirming(false)
    setDrawerOpen(true)
  }

  function selectSuggestion(c: Customer) {
    setAcOpen(false)
    setAcIndex(-1)
    openEdit(c)
  }

  function requestClose() {
    if (formDirty) setConfirming(true)
    else forceClose()
  }

  function forceClose() {
    setDrawerOpen(false)
    setConfirming(false)
    setFormDirty(false)
  }

  function handleSaved(saved: Customer) {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      }
      return [...prev, saved].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    })
    forceClose()
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.document?.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
    )
  })

  const suggestions = filtered.slice(0, 8)
  const showAc = acOpen && search.trim().length > 0 && filtered.length > 0

  // Atualiza o ref a cada render para que o listener de teclado leia sempre valores frescos
  acStateRef.current = { acOpen, acIndex, filtered }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Botão: primeiro no mobile, último no desktop */}
        <Button onClick={openNew} className="gap-2 shrink-0 w-full sm:w-auto justify-center order-first sm:order-last">
          <Plus className="size-4" />
          Novo cliente
        </Button>

        {/* Busca: abaixo do botão no mobile, antes no desktop */}
        <div ref={searchRef} className="relative sm:flex-1 sm:max-w-sm order-last sm:order-first">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none z-10" />
          <Input
            value={search}
            autoComplete="off"
            placeholder="Buscar por nome, CPF, e-mail, telefone..."
            className="pl-9"
            onChange={(e) => {
              setSearch(e.target.value)
              setAcOpen(true)
              setAcIndex(-1)
            }}
            onFocus={() => { if (search.trim()) setAcOpen(true) }}
          />

          {/* Dropdown */}
          {showAc && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-white/10 bg-slate-900/98 backdrop-blur-sm shadow-2xl shadow-black/60 overflow-hidden">
              <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
                {suggestions.map((c, i) => {
                  const active = i === acIndex
                  const phoneDisplay = formatPhone(c.phone ?? c.whatsapp)
                  return (
                    <li key={c.id} role="option" aria-selected={active}>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); selectSuggestion(c) }}
                        onMouseEnter={() => setAcIndex(i)}
                        className={[
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          active ? "bg-white/8" : "hover:bg-white/4",
                        ].join(" ")}
                      >
                        <div className="size-8 rounded-full bg-brand-500/15 ring-1 ring-brand-500/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-brand-300">{initials(c.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {highlight(c.name, search)}
                          </p>
                          <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                            {c.document && (
                              <span className="text-xs text-slate-500">{highlight(c.document, search)}</span>
                            )}
                            {phoneDisplay && (
                              <span className="text-xs text-slate-500">{highlight(phoneDisplay, search)}</span>
                            )}
                            {c.email && (
                              <span className="text-xs text-slate-600 truncate">{highlight(c.email, search)}</span>
                            )}
                          </div>
                        </div>
                        {c.city && (
                          <span className="text-xs text-slate-600 shrink-0 hidden sm:block">
                            {c.city}{c.state ? `/${c.state}` : ""}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {filtered.length > 8 && (
                <div className="px-3 py-2 border-t border-white/6">
                  <p className="text-xs text-slate-600">
                    +{filtered.length - 8} resultado{filtered.length - 8 !== 1 ? "s" : ""} — continue digitando para refinar
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-slate-500 mb-3">
          {filtered.length === 0
            ? "Nenhum cliente"
            : `${filtered.length} cliente${filtered.length !== 1 ? "s" : ""}`}
          {search && customers.length !== filtered.length && ` de ${customers.length}`}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="size-10 text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm font-medium">
            {search ? `Sem resultados para "${search}"` : "Nenhum cliente cadastrado"}
          </p>
          {!search && (
            <p className="text-slate-600 text-xs mt-1">
              Clique em &quot;Novo cliente&quot; para começar
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-4 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 hover:border-white/10 hover:bg-white/[0.04] transition-all"
            >
              {/* Avatar */}
              <div className="size-10 rounded-full bg-brand-500/15 ring-1 ring-brand-500/25 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-brand-300">{initials(c.name)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="font-semibold text-white text-sm truncate">{c.name}</p>
                  {c.document && (
                    <p className="text-xs text-slate-500 shrink-0">{c.document}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  {/* Telefone (oculto se igual ao whatsapp) */}
                  {c.phone && c.phone !== c.whatsapp && (
                    <PhoneLink number={c.phone} />
                  )}
                  {/* WhatsApp com submenu */}
                  {c.whatsapp && (
                    <WhatsAppMenu number={c.whatsapp} />
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-500 hover:text-slate-300 truncate transition-colors"
                    >
                      {c.email}
                    </a>
                  )}
                  {c.city && (
                    <p className="text-xs text-slate-600 shrink-0">
                      {c.city}{c.state ? `/${c.state}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit */}
              <button
                onClick={() => openEdit(c)}
                className="shrink-0 sm:opacity-0 sm:group-hover:opacity-100 size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all"
                title="Editar cliente"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={forceClose}
        onCloseRequest={requestClose}
        title={editingCustomer ? "Editar cliente" : "Novo cliente"}
        description={editingCustomer ? editingCustomer.name : "Preencha os dados do cliente"}
      >
        {/* Unsaved changes guard */}
        {confirming && (
          <div className="mx-6 mt-5 flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
            <p className="text-sm font-medium text-amber-300">Há alterações não salvas. Deseja sair mesmo assim?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition"
              >
                Continuar editando
              </button>
              <button
                onClick={forceClose}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition"
              >
                Sair sem salvar
              </button>
            </div>
          </div>
        )}

        <CustomerForm
          key={editingCustomer?.id ?? "new"}
          customer={editingCustomer}
          onDirtyChange={setFormDirty}
          onSaved={handleSaved}
        />
      </Drawer>
    </>
  )
}
