interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const MAX = Number(process.env.RATE_LIMIT_MAX ?? 10)
const WINDOW = Number(process.env.RATE_LIMIT_WINDOW ?? 60_000)

export function rateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW })
    return { allowed: true, remaining: MAX - 1, resetAt: now + WINDOW }
  }

  if (entry.count >= MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: MAX - entry.count, resetAt: entry.resetAt }
}

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60_000)
