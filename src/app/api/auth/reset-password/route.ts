import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { resetPasswordSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown"
  const { allowed } = rateLimit(`reset-password:${ip}`)

  if (!allowed) {
    return NextResponse.json(
      { message: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const parsed = resetPasswordSchema.safeParse(body)

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Dados inválidos."
    return NextResponse.json({ message: firstError }, { status: 400 })
  }

  const { token, password } = parsed.data

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, active: true } } },
  })

  if (!resetToken) {
    return NextResponse.json(
      { message: "Link inválido ou já utilizado." },
      { status: 400 }
    )
  }

  if (resetToken.usedAt) {
    return NextResponse.json(
      { message: "Este link já foi utilizado. Solicite um novo." },
      { status: 400 }
    )
  }

  if (new Date() > resetToken.expiresAt) {
    return NextResponse.json(
      { message: "Link expirado. Solicite um novo link de recuperação." },
      { status: 400 }
    )
  }

  if (!resetToken.user.active) {
    return NextResponse.json(
      { message: "Conta desativada. Entre em contato com o suporte." },
      { status: 403 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Invalida todas as sessões ativas do usuário
    db.session.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ])

  return NextResponse.json({ message: "Senha redefinida com sucesso." })
}
