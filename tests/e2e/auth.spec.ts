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
    await expect(page.getByLabel(/senha/i)).toBeVisible()
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
    await page.getByLabel(/senha/i).fill("senhaerrada")
    await page.getByRole("button", { name: /entrar/i }).click()
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible({ timeout: 5000 })
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

test.describe("Proteção de rotas", () => {
  test("redireciona /dashboard para /login quando não autenticado", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })
})
