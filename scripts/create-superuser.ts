#!/usr/bin/env tsx
/**
 * Cria o primeiro superusuário (ADMIN) no banco de dados.
 * Uso:  npm run superuser
 *       ou: npx tsx scripts/create-superuser.ts
 *
 * Aceita variáveis de ambiente para uso não-interativo (CI/CD):
 *   SUPERUSER_EMAIL=admin@exemplo.com
 *   SUPERUSER_NAME="Nome Completo"
 *   SUPERUSER_PASSWORD=SenhaForte@123
 */
import { createInterface } from "readline"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

function ask(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

function askPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question)
    process.stdin.setRawMode?.(true)
    process.stdin.resume()
    process.stdin.setEncoding("utf8")

    let password = ""
    process.stdin.on("data", function handler(char: string) {
      if (char === "\n" || char === "\r" || char === "") {
        process.stdin.setRawMode?.(false)
        process.stdin.pause()
        process.stdin.removeListener("data", handler)
        process.stdout.write("\n")
        resolve(password)
      } else if (char === "") {
        password = password.slice(0, -1)
      } else {
        password += char
        process.stdout.write("*")
      }
    })
  })
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Mínimo 8 caracteres"
  if (!/[A-Z]/.test(pw)) return "Precisa de pelo menos uma maiúscula"
  if (!/[0-9]/.test(pw)) return "Precisa de pelo menos um número"
  if (!/[^A-Za-z0-9]/.test(pw)) return "Precisa de pelo menos um caractere especial (!@#$...)"
  return null
}

async function main() {
  console.log("\n========================================")
  console.log("  MotorMind — Criar Superusuário (Admin)")
  console.log("========================================\n")

  let email = process.env.SUPERUSER_EMAIL ?? ""
  let name = process.env.SUPERUSER_NAME ?? ""
  let password = process.env.SUPERUSER_PASSWORD ?? ""
  const nonInteractive = !!(email && password)

  if (!nonInteractive) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })

    email = (await ask(rl, "E-mail do admin: ")).trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("E-mail inválido.")
      rl.close()
      process.exit(1)
    }

    name = (await ask(rl, "Nome completo: ")).trim()
    if (!name) name = "Administrador"

    rl.close()

    while (true) {
      password = await askPassword("Senha (mínimo 8 chars, maiúscula, número, especial): ")
      const err = validatePassword(password)
      if (!err) break
      console.error(`  ✗ ${err}`)
    }

    const confirm = await askPassword("Confirme a senha: ")
    if (password !== confirm) {
      console.error("As senhas não conferem.")
      process.exit(1)
    }
  } else {
    const err = validatePassword(password)
    if (err) {
      console.error(`Senha inválida: ${err}`)
      process.exit(1)
    }
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.error(`\nUm usuário com e-mail "${email}" já existe.`)
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: {
      name: name || "Administrador",
      email,
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      active: true,
    },
  })

  console.log(`\n✓ Superusuário criado com sucesso!`)
  console.log(`  ID:    ${user.id}`)
  console.log(`  Nome:  ${user.name}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Role:  ${user.role}`)
  console.log("\n  Acesse /login para entrar.\n")
}

main()
  .catch((err) => {
    console.error("\nErro:", err.message)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
