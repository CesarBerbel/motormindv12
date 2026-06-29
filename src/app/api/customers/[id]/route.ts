import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { customerSchema } from "@/lib/validations"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
  }

  const customer = await db.customer.update({
    where: { id },
    data: parsed.data,
  })

  return Response.json(customer)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  await db.customer.delete({ where: { id } })
  return Response.json({ ok: true })
}
