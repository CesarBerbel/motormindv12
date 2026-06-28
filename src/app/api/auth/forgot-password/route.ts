import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"
import { getBaseUrl } from "@/lib/utils"

const schema = z.object({ email: z.string().email().toLowerCase() })

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown"
  const { allowed } = rateLimit(`forgot-password:${ip}`)

  if (!allowed) {
    return NextResponse.json(
      { message: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ message: "E-mail inválido." }, { status: 400 })
  }

  const { email } = parsed.data

  const user = await db.user.findUnique({
    where: { email, active: true },
    select: { id: true, email: true, name: true },
  })

  // Resposta idêntica mesmo se o usuário não existir (evita user enumeration)
  if (!user) {
    return NextResponse.json({
      message: "Se o e-mail existir em nossa base, você receberá as instruções em breve.",
    })
  }

  // Invalida tokens anteriores do mesmo usuário
  await db.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  })

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await db.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`

  await sendPasswordResetEmail(user.email, resetUrl)

  return NextResponse.json({
    message: "Se o e-mail existir em nossa base, você receberá as instruções em breve.",
  })
}
