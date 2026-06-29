import {
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  workshopSchema,
  customerSchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations"

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

describe("workshopSchema", () => {
  it("aceita dados mínimos válidos (só nome)", () => {
    expect(workshopSchema.safeParse({ name: "Oficina Silva" }).success).toBe(true)
  })

  it("rejeita quando nome está ausente", () => {
    expect(workshopSchema.safeParse({}).success).toBe(false)
  })

  it("rejeita quando nome é string vazia", () => {
    expect(workshopSchema.safeParse({ name: "" }).success).toBe(false)
  })

  it("aceita e-mail válido", () => {
    const result = workshopSchema.safeParse({ name: "Oficina", email: "contato@oficina.com" })
    expect(result.success).toBe(true)
  })

  it("rejeita e-mail inválido", () => {
    const result = workshopSchema.safeParse({ name: "Oficina", email: "nao-e-email" })
    expect(result.success).toBe(false)
  })

  it("aceita e-mail vazio (campo opcional)", () => {
    const result = workshopSchema.safeParse({ name: "Oficina", email: "" })
    expect(result.success).toBe(true)
  })

  it("aplica default 'Brasil' para country", () => {
    const result = workshopSchema.safeParse({ name: "Oficina" })
    expect(result.data?.country).toBe("Brasil")
  })

  it("aceita todos os campos preenchidos", () => {
    const result = workshopSchema.safeParse({
      name: "Oficina", tradeName: "Silva Auto", cnpj: "12.345.678/0001-95",
      phone: "(11) 9999-9999", email: "contato@oficina.com",
      zipCode: "01310-100", street: "Rua A", number: "1",
      city: "São Paulo", state: "SP",
    })
    expect(result.success).toBe(true)
  })
})

describe("customerSchema", () => {
  it("aceita dados mínimos válidos (nome com 2+ chars)", () => {
    expect(customerSchema.safeParse({ name: "Jo" }).success).toBe(true)
  })

  it("rejeita nome com menos de 2 caracteres", () => {
    expect(customerSchema.safeParse({ name: "J" }).success).toBe(false)
  })

  it("rejeita quando nome está ausente", () => {
    expect(customerSchema.safeParse({}).success).toBe(false)
  })

  it("aceita e-mail válido", () => {
    const result = customerSchema.safeParse({ name: "João", email: "joao@email.com" })
    expect(result.success).toBe(true)
  })

  it("rejeita e-mail inválido", () => {
    expect(customerSchema.safeParse({ name: "João", email: "invalido" }).success).toBe(false)
  })

  it("aceita e-mail vazio (campo opcional)", () => {
    expect(customerSchema.safeParse({ name: "João", email: "" }).success).toBe(true)
  })

  it("aceita dados de contato e endereço opcionais", () => {
    const result = customerSchema.safeParse({
      name: "João Silva", phone: "(11) 9999-9999", whatsapp: "(11) 9999-9999",
      zipCode: "01310-100", street: "Rua A", city: "SP", state: "SP",
    })
    expect(result.success).toBe(true)
  })
})

describe("createUserSchema", () => {
  const validUser = {
    name: "João Silva",
    email: "joao@oficina.com",
    password: "Senha@123",
    role: "ATTENDANT" as const,
  }

  it("aceita usuário válido", () => {
    expect(createUserSchema.safeParse(validUser).success).toBe(true)
  })

  it("normaliza e-mail para lowercase", () => {
    const result = createUserSchema.safeParse({ ...validUser, email: "JOAO@OFICINA.COM" })
    expect(result.data?.email).toBe("joao@oficina.com")
  })

  it("rejeita nome com menos de 2 caracteres", () => {
    expect(createUserSchema.safeParse({ ...validUser, name: "J" }).success).toBe(false)
  })

  it("rejeita e-mail inválido", () => {
    expect(createUserSchema.safeParse({ ...validUser, email: "invalido" }).success).toBe(false)
  })

  it("rejeita role inválida", () => {
    expect(createUserSchema.safeParse({ ...validUser, role: "SUPERUSER" }).success).toBe(false)
  })

  it("aceita todas as roles válidas", () => {
    for (const role of ["ADMIN", "MANAGER", "ATTENDANT", "MECHANIC"] as const) {
      expect(createUserSchema.safeParse({ ...validUser, role }).success).toBe(true)
    }
  })

  it("rejeita senha fraca (sem maiúscula)", () => {
    expect(createUserSchema.safeParse({ ...validUser, password: "senha@123" }).success).toBe(false)
  })

  it("rejeita senha fraca (sem número)", () => {
    expect(createUserSchema.safeParse({ ...validUser, password: "Senha@abc" }).success).toBe(false)
  })

  it("rejeita senha fraca (sem caractere especial)", () => {
    expect(createUserSchema.safeParse({ ...validUser, password: "SenhaForte1" }).success).toBe(false)
  })

  it("rejeita senha com menos de 8 caracteres", () => {
    expect(createUserSchema.safeParse({ ...validUser, password: "S@1a" }).success).toBe(false)
  })
})

describe("updateUserSchema", () => {
  const validUpdate = {
    name: "João Silva",
    email: "joao@oficina.com",
    role: "ATTENDANT" as const,
    active: true,
  }

  it("aceita atualização válida sem senha", () => {
    expect(updateUserSchema.safeParse(validUpdate).success).toBe(true)
  })

  it("aceita senha em branco (manter senha atual)", () => {
    expect(updateUserSchema.safeParse({ ...validUpdate, password: "" }).success).toBe(true)
  })

  it("aceita nova senha forte", () => {
    expect(updateUserSchema.safeParse({ ...validUpdate, password: "Nova@Senha1" }).success).toBe(true)
  })

  it("rejeita nova senha fraca quando fornecida", () => {
    expect(updateUserSchema.safeParse({ ...validUpdate, password: "fraca" }).success).toBe(false)
  })

  it("exige campo active", () => {
    expect(updateUserSchema.safeParse({ name: "João", email: "j@j.com", role: "ATTENDANT" }).success).toBe(false)
  })
})

describe("updateProfileSchema", () => {
  it("aceita nome válido", () => {
    expect(updateProfileSchema.safeParse({ name: "João Silva" }).success).toBe(true)
  })

  it("rejeita nome com menos de 2 caracteres", () => {
    expect(updateProfileSchema.safeParse({ name: "J" }).success).toBe(false)
  })

  it("aceita telefone opcional", () => {
    expect(updateProfileSchema.safeParse({ name: "João", phone: "(11) 99999-9999" }).success).toBe(true)
  })

  it("aceita sem telefone", () => {
    expect(updateProfileSchema.safeParse({ name: "João" }).success).toBe(true)
  })
})

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "SenhaAtual@1",
    newPassword: "NovaSenha@1",
    confirmPassword: "NovaSenha@1",
  }

  it("aceita troca de senha válida", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true)
  })

  it("rejeita quando confirmação não confere", () => {
    const result = changePasswordSchema.safeParse({ ...valid, confirmPassword: "Diferente@1" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined()
    }
  })

  it("rejeita senha atual vazia", () => {
    expect(changePasswordSchema.safeParse({ ...valid, currentPassword: "" }).success).toBe(false)
  })

  it("rejeita nova senha fraca", () => {
    expect(changePasswordSchema.safeParse({ ...valid, newPassword: "fraca", confirmPassword: "fraca" }).success).toBe(false)
  })

  it("rejeita nova senha sem maiúscula", () => {
    const weak = { ...valid, newPassword: "nova@senha1", confirmPassword: "nova@senha1" }
    expect(changePasswordSchema.safeParse(weak).success).toBe(false)
  })
})
