import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { ProfileForm } from "@/components/profile/ProfileForm"

export const metadata: Metadata = { title: "Meu Perfil" }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: { id: true, name: true, email: true, phone: true, role: true, specialty: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-10 relative">
        <div className="pointer-events-none absolute -left-8 -top-8 size-40 bg-brand-500/6 rounded-full blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-1">Conta</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Meu Perfil</h1>
        <p className="mt-1.5 text-slate-400 text-sm">Gerencie seus dados pessoais e senha de acesso</p>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}
