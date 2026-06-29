import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { customerSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const search = req.nextUrl.searchParams.get("q") ?? ""

  const customers = await db.customer.findMany({
    where: search
      ? {
          OR: [
            { name:     { contains: search, mode: "insensitive" } },
            { document: { contains: search, mode: "insensitive" } },
            { email:    { contains: search, mode: "insensitive" } },
            { phone:    { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, document: true, email: true,
      phone: true, whatsapp: true, birthDate: true,
      notes: true, zipCode: true, street: true, number: true,
      complement: true, neighborhood: true, city: true, state: true,
      createdAt: true,
    },
  })

  return Response.json(customers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
  }

  const customer = await db.customer.create({
    data: parsed.data,
  })

  return Response.json(customer, { status: 201 })
}
