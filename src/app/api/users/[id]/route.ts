import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { updateUserSchema } from "@/lib/validations"

function canManageUsers(role: string) {
  return role === "ADMIN" || role === "MANAGER"
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const currentRole = session.user.role as string
  if (!canManageUsers(currentRole)) {
    return Response.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params

  const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!target) return Response.json({ error: "Usuário não encontrado" }, { status: 404 })

  // MANAGER não pode editar ADMIN
  if (currentRole === "MANAGER" && target.role === "ADMIN") {
    return Response.json({ error: "Sem permissão para editar Administrador" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
  }

  const { name, email, phone, role, specialty, active, password } = parsed.data

  // MANAGER não pode promover para ADMIN
  if (currentRole === "MANAGER" && role === "ADMIN") {
    return Response.json({ error: "Sem permissão para definir Administrador" }, { status: 403 })
  }

  // Não pode desativar a si mesmo
  if (id === session.user.id && active === false) {
    return Response.json({ error: "Não é possível desativar sua própria conta" }, { status: 400 })
  }

  // Verificar e-mail duplicado (se mudou)
  const existing = await db.user.findFirst({ where: { email, NOT: { id } } })
  if (existing) return Response.json({ error: "E-mail já cadastrado" }, { status: 409 })

  const data: Record<string, unknown> = { name, email, phone: phone || null, role, specialty: specialty || null, active }
  if (password) {
    data.password = await bcrypt.hash(password, 12)
  }

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, specialty: true, phone: true, active: true, createdAt: true },
  })

  return Response.json(user)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const currentRole = session.user.role as string
  if (!canManageUsers(currentRole)) {
    return Response.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return Response.json({ error: "Não é possível alterar seu próprio status" }, { status: 400 })
  }

  const target = await db.user.findUnique({ where: { id }, select: { active: true, role: true } })
  if (!target) return Response.json({ error: "Usuário não encontrado" }, { status: 404 })

  if (currentRole === "MANAGER" && target.role === "ADMIN") {
    return Response.json({ error: "Sem permissão" }, { status: 403 })
  }

  const user = await db.user.update({
    where: { id },
    data: { active: !target.active },
    select: { id: true, active: true },
  })

  return Response.json(user)
}
