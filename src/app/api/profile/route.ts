import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { updateProfileSchema } from "@/lib/validations"

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id as string },
    select: { id: true, name: true, email: true, phone: true, role: true, specialty: true, createdAt: true },
  })

  return Response.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
  }

  const user = await db.user.update({
    where: { id: session.user.id as string },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
    select: { id: true, name: true, email: true, phone: true, role: true },
  })

  return Response.json(user)
}
