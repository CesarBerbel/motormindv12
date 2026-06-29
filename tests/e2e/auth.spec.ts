import { test, expect } from "@playwright/test"

test.describe("Página pública", () => {
  test("exibe hero com botão Entrar", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/MotorMind/)
    await expect(page.getByRole("link", { name: /acessar plataforma/i })).toBeVisible()
  })

  test("botão Entrar redireciona para /login", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /acessar plataforma/i }).first().click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
  })

  test("exibe formulário de login", async ({ page }) => {
    await expect(page.getByLabel(/e-mail/i)).toBeVisible()
    await expect(page.getByLabel("Senha", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible()
  })

  test("link Esqueceu a senha navega para /forgot-password", async ({ page }) => {
    await page.getByRole("link", { name: /esqueceu a senha/i }).click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test("link Voltar ao site navega para /", async ({ page }) => {
    await page.getByRole("link", { name: /voltar ao site/i }).click()
    await expect(page).toHaveURL("/")
  })

  test("mostra erro com credenciais inválidas", async ({ page }) => {
    await page.getByLabel(/e-mail/i).fill("invalido@test.com")
    await page.getByLabel("Senha", { exact: true }).fill("senhaerrada")
    await page.getByRole("button", { name: /entrar/i }).click()
    await expect(page.getByText("Credenciais inválidas", { exact: true })).toBeVisible({ timeout: 8000 })
  })

  test("valida campos obrigatórios antes de submeter", async ({ page }) => {
    await page.getByRole("button", { name: /entrar/i }).click()
    await expect(page.getByText(/e-mail/i).first()).toBeVisible()
  })
})

test.describe("Recuperação de senha", () => {
  test("exibe formulário", async ({ page }) => {
    await page.goto("/forgot-password")
    await expect(page.getByLabel(/e-mail/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /enviar instruções/i })).toBeVisible()
  })

  test("exibe confirmação após envio", async ({ page }) => {
    await page.goto("/forgot-password")
    await page.getByLabel(/e-mail/i).fill("qualquer@email.com")
    await page.getByRole("button", { name: /enviar instruções/i }).click()
    await expect(page.getByText(/verifique seu e-mail/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe("Reset de senha", () => {
  test("link sem token mostra mensagem de link inválido", async ({ page }) => {
    await page.goto("/reset-password")
    await expect(page.getByText(/link inválido/i)).toBeVisible()
    await expect(page.getByRole("link", { name: /solicitar novo link/i })).toBeVisible()
  })

  test("token inválido retorna erro ao submeter", async ({ page }) => {
    await page.goto("/reset-password?token=token-invalido-qualquer")
    await page.getByLabel("Nova senha", { exact: true }).fill("Senha@Nova123")
    await page.getByLabel(/confirmar/i).fill("Senha@Nova123")
    await page.getByRole("button", { name: /salvar nova senha/i }).click()
    await expect(page.getByText(/inválido|expirado|utilizado/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe("Proteção de rotas", () => {
  test("redireciona /dashboard para /login quando não autenticado", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })
})
