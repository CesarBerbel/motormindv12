import { signInSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations"

describe("signInSchema", () => {
  it("aceita credenciais válidas", () => {
    const result = signInSchema.safeParse({ email: "User@Test.com", password: "password123" })
    expect(result.success).toBe(true)
    expect(result.data?.email).toBe("user@test.com") // lowercased
  })

  it("rejeita e-mail inválido", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "password123" })
    expect(result.success).toBe(false)
  })

  it("rejeita senha muito curta", () => {
    const result = signInSchema.safeParse({ email: "a@b.com", password: "123" })
    expect(result.success).toBe(false)
  })

  it("rejeita campos ausentes", () => {
    expect(signInSchema.safeParse({}).success).toBe(false)
  })
})

describe("forgotPasswordSchema", () => {
  it("aceita e-mail válido e normaliza para lowercase", () => {
    const result = forgotPasswordSchema.safeParse({ email: "ADMIN@SITE.COM" })
    expect(result.success).toBe(true)
    expect(result.data?.email).toBe("admin@site.com")
  })

  it("rejeita e-mail inválido", () => {
    expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  const valid = {
    token: "abc123",
    password: "Senha@Forte1",
    confirmPassword: "Senha@Forte1",
  }

  it("aceita senha forte com confirmação igual", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it("rejeita senhas que não conferem", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, confirmPassword: "Diferente@1" })
    expect(result.success).toBe(false)
  })

  it("rejeita senha sem maiúscula", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, password: "senha@forte1", confirmPassword: "senha@forte1" })
    expect(result.success).toBe(false)
  })

  it("rejeita senha sem número", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, password: "Senha@Forte!", confirmPassword: "Senha@Forte!" })
    expect(result.success).toBe(false)
  })

  it("rejeita senha sem especial", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, password: "SenhaForte1", confirmPassword: "SenhaForte1" })
    expect(result.success).toBe(false)
  })
})
