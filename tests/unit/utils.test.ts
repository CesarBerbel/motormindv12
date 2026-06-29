/** @jest-environment node */
import { describe, it, expect } from "@jest/globals"
import { cn, getBaseUrl, formatDate } from "@/lib/utils"

describe("cn", () => {
  it("retorna string vazia sem args", () => {
    expect(cn()).toBe("")
  })

  it("combina classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("resolve conflitos tailwind (último vence)", () => {
    expect(cn("p-4", "p-8")).toBe("p-8")
  })

  it("ignora valores falsy", () => {
    expect(cn("foo", undefined, null as unknown as string, "bar")).toBe("foo bar")
  })
})

describe("getBaseUrl", () => {
  const originalWindow = global.window

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error restoring undefined
      delete global.window
    } else {
      global.window = originalWindow
    }
    delete process.env.NEXTAUTH_URL
  })

  it("retorna string vazia quando window está definido (browser)", () => {
    // @ts-expect-error simulando browser
    global.window = {}
    expect(getBaseUrl()).toBe("")
  })

  it("usa NEXTAUTH_URL quando definido no servidor", () => {
    // @ts-expect-error garantir sem window
    delete global.window
    process.env.NEXTAUTH_URL = "https://app.motormind.com.br"
    expect(getBaseUrl()).toBe("https://app.motormind.com.br")
  })

  it("usa localhost com porta 3000 como fallback", () => {
    // @ts-expect-error garantir sem window
    delete global.window
    delete process.env.NEXTAUTH_URL
    delete process.env.PORT
    expect(getBaseUrl()).toBe("http://localhost:3000")
  })
})

describe("formatDate", () => {
  it("formata Date object em pt-BR", () => {
    const result = formatDate(new Date(2024, 0, 15)) // 15 jan 2024
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2024/)
  })

  it("formata string ISO em pt-BR", () => {
    const result = formatDate("2024-06-01T00:00:00.000Z")
    expect(result).toMatch(/2024/)
  })
})
