import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { workshopSchema } from "@/lib/validations"

const CAN_MANAGE = ["ADMIN", "MANAGER"]

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!CAN_MANAGE.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const workshop = await db.workshop.findUnique({ where: { id: "singleton" } })
  return NextResponse.json(workshop)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!CAN_MANAGE.includes(session.user.role as string)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = workshopSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  const workshop = await db.workshop.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.json(workshop)
}
