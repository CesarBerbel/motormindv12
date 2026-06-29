/** @jest-environment node */
import { NextRequest } from "next/server"

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("@/auth", () => ({ auth: jest.fn() }))
jest.mock("@/lib/db", () => ({
  db: {
    workshop: {
      findUnique: jest.fn(),
      upsert:     jest.fn(),
    },
  },
}))

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { GET, PUT } from "@/app/api/workshop/route"

const mockAuth      = auth               as jest.Mock
const mockFindUnique = db.workshop.findUnique as jest.Mock
const mockUpsert    = db.workshop.upsert as jest.Mock

const ADMIN_SESSION   = { user: { id: "u1", role: "ADMIN"     } }
const MANAGER_SESSION = { user: { id: "u2", role: "MANAGER"   } }
const ATTEND_SESSION  = { user: { id: "u3", role: "ATTENDANT" } }

const WORKSHOP = {
  id: "singleton", name: "Oficina Silva", tradeName: null, cnpj: null,
  phone: null, email: "contato@oficina.com", country: "Brasil",
}

function makeRequest(method: string, body?: unknown) {
  return new NextRequest("http://localhost/api/workshop", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

// ── GET /api/workshop ─────────────────────────────────────────────────────────
describe("GET /api/workshop", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("retorna 403 para ATTENDANT (sem permissão)", async () => {
    mockAuth.mockResolvedValue(ATTEND_SESSION)
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it("retorna dados da oficina para ADMIN", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue(WORKSHOP)

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.name).toBe("Oficina Silva")
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "singleton" } })
  })

  it("retorna dados da oficina para MANAGER", async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    mockFindUnique.mockResolvedValue(WORKSHOP)

    const res = await GET()
    expect(res.status).toBe(200)
  })

  it("retorna null quando oficina não foi configurada ainda", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue(null)

    const res = await GET()
    const data = await res.json()
    expect(data).toBeNull()
  })
})

// ── PUT /api/workshop ─────────────────────────────────────────────────────────
describe("PUT /api/workshop", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(makeRequest("PUT", { name: "Oficina" }))
    expect(res.status).toBe(401)
  })

  it("retorna 403 para ATTENDANT", async () => {
    mockAuth.mockResolvedValue(ATTEND_SESSION)
    const res = await PUT(makeRequest("PUT", { name: "Oficina" }))
    expect(res.status).toBe(403)
  })

  it("retorna 400 quando nome está ausente", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    const res = await PUT(makeRequest("PUT", { phone: "(11) 9999-9999" }))
    expect(res.status).toBe(400)
  })

  it("retorna 400 quando e-mail é inválido", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    const res = await PUT(makeRequest("PUT", { name: "Oficina", email: "invalido" }))
    expect(res.status).toBe(400)
  })

  it("faz upsert e retorna os dados atualizados", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockUpsert.mockResolvedValue(WORKSHOP)

    const res = await PUT(makeRequest("PUT", { name: "Oficina Silva", email: "contato@oficina.com" }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.name).toBe("Oficina Silva")
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "singleton" } })
    )
  })

  it("MANAGER também pode atualizar oficina", async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    mockUpsert.mockResolvedValue(WORKSHOP)

    const res = await PUT(makeRequest("PUT", { name: "Oficina" }))
    expect(res.status).toBe(200)
  })
})
