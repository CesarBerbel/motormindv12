import { z } from "zod"

export const signInSchema = z.object({
  email: z
    .string({ required_error: "E-mail obrigatório" })
    .email("E-mail inválido")
    .toLowerCase(),
  password: z
    .string({ required_error: "Senha obrigatória" })
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "E-mail obrigatório" })
    .email("E-mail inválido")
    .toLowerCase(),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter pelo menos um número")
      .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  })

export const workshopSchema = z.object({
  name: z.string().min(1, "Nome da oficina é obrigatório"),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
  stateReg: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  logoUrl: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("Brasil"),
})

const passwordStrength = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Deve conter letra maiúscula")
  .regex(/[0-9]/, "Deve conter número")
  .regex(/[^A-Za-z0-9]/, "Deve conter caractere especial")

export const ROLES = ["ADMIN", "MANAGER", "ATTENDANT", "MECHANIC"] as const
export type Role = (typeof ROLES)[number]

export const createUserSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido").toLowerCase(),
  phone: z.string().optional(),
  role: z.enum(ROLES),
  specialty: z.string().optional(),
  password: passwordStrength,
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido").toLowerCase(),
  phone: z.string().optional(),
  role: z.enum(ROLES),
  specialty: z.string().optional(),
  active: z.boolean(),
  password: passwordStrength.optional().or(z.literal("")),
})

export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type WorkshopInput = z.infer<typeof workshopSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
