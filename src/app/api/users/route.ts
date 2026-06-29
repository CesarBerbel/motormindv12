import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { createUserSchema } from "@/lib/validations"

function canManageUsers(role: string) {
  return role === "ADMIN" || role === "MANAGER"
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })
  if (!canManageUsers(session.user.role as string)) {
    return Response.json({ error: "Sem permissão" }, { status: 403 })
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      specialty: true,
      phone: true,
      active: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  })

  return Response.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const currentRole = session.user.role as string
  if (!canManageUsers(currentRole)) {
    return Response.json({ error: "Sem permissão" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
  }

  const { name, email, phone, role, specialty, password } = parsed.data

  // MANAGER não pode criar ADMIN
  if (currentRole === "MANAGER" && role === "ADMIN") {
    return Response.json({ error: "Sem permissão para criar Administrador" }, { status: 403 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: "E-mail já cadastrado" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      role,
      specialty: specialty || null,
      password: hashed,
      emailVerified: new Date(),
    },
    select: { id: true, name: true, email: true, role: true, specialty: true, phone: true, active: true, createdAt: true },
  })

  return Response.json(user, { status: 201 })
}
