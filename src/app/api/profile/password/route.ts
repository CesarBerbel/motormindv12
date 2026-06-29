import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { changePasswordSchema } from "@/lib/validations"

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: { password: true },
  })

  if (!user?.password) {
    return Response.json({ error: "Usuário sem senha definida" }, { status: 400 })
  }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    return Response.json({ error: "Senha atual incorreta" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)

  await db.$transaction([
    db.user.update({
      where: { id: session.user.id as string },
      data: { password: hashed },
    }),
    // Invalida todas as sessões ativas (força novo login)
    db.session.deleteMany({ where: { userId: session.user.id as string } }),
  ])

  return Response.json({ ok: true })
}
