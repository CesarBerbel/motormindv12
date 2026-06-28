import { rateLimit } from "@/lib/rate-limit"

describe("rateLimit", () => {
  it("permite requisições dentro do limite", () => {
    const key = `test-${Math.random()}`
    const result = rateLimit(key)
    expect(result.allowed).toBe(true)
  })

  it("bloqueia após exceder o limite", () => {
    const key = `test-${Math.random()}`
    const max = Number(process.env.RATE_LIMIT_MAX ?? 10)

    for (let i = 0; i < max; i++) {
      rateLimit(key)
    }

    const blocked = rateLimit(key)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it("retorna remaining correto", () => {
    const key = `test-${Math.random()}`
    const max = Number(process.env.RATE_LIMIT_MAX ?? 10)

    const first = rateLimit(key)
    expect(first.remaining).toBe(max - 1)

    const second = rateLimit(key)
    expect(second.remaining).toBe(max - 2)
  })
})
