import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { CustomersManager } from "@/components/customers/CustomersManager"

export const metadata: Metadata = { title: "Clientes" }

export default async function CustomersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-10 relative">
        <div className="pointer-events-none absolute -left-8 -top-8 size-40 bg-brand-500/6 rounded-full blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-1">Cadastros</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
        <p className="mt-1.5 text-slate-400 text-sm">Gerencie o cadastro de clientes da oficina</p>
      </div>

      <CustomersManager />
    </div>
  )
}
