import type { Role } from "@/lib/validations"

const CONFIG: Record<Role, { label: string; className: string }> = {
  ADMIN:     { label: "Administrador", className: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25" },
  MANAGER:   { label: "Gerente",       className: "bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25" },
  ATTENDANT: { label: "Atendente",     className: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25" },
  MECHANIC:  { label: "Mecânico",      className: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25" },
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, className } = CONFIG[role] ?? CONFIG.ATTENDANT
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
