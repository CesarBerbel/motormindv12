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

export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
