/** @jest-environment node */
import { NextRequest } from "next/server"

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("@/auth", () => ({ auth: jest.fn() }))
jest.mock("@/lib/db", () => ({
  db: {
    customer: {
      findMany: jest.fn(),
      create:   jest.fn(),
      update:   jest.fn(),
      delete:   jest.fn(),
    },
  },
}))

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { GET, POST } from "@/app/api/customers/route"
import { PUT, DELETE } from "@/app/api/customers/[id]/route"

const mockAuth     = auth     as jest.Mock
const mockFindMany = db.customer.findMany as jest.Mock
const mockCreate   = db.customer.create  as jest.Mock
const mockUpdate   = db.customer.update  as jest.Mock
const mockDelete   = db.customer.delete  as jest.Mock

const SESSION = { user: { id: "user1", role: "ADMIN" } }

function makeRequest(method: string, body?: unknown, url = "http://localhost/api/customers") {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

const CUSTOMER = {
  id: "c1", name: "João Silva", document: null, email: "joao@email.com",
  phone: "(11) 9999-9999", whatsapp: null, birthDate: null, notes: null,
  zipCode: null, street: null, number: null, complement: null,
  neighborhood: null, city: "São Paulo", state: "SP", createdAt: new Date(),
}

beforeEach(() => jest.clearAllMocks())

// ── GET /api/customers ────────────────────────────────────────────────────────
describe("GET /api/customers", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET(makeRequest("GET"))
    expect(res.status).toBe(401)
  })

  it("retorna lista de clientes", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockFindMany.mockResolvedValue([CUSTOMER])

    const res = await GET(makeRequest("GET"))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe("João Silva")
  })

  it("passa o termo de busca para o Prisma via parâmetro q", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockFindMany.mockResolvedValue([])

    const req = new NextRequest("http://localhost/api/customers?q=joao", { method: "GET" })
    await GET(req)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      })
    )
  })

  it("sem parâmetro q busca todos os clientes sem filtro", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockFindMany.mockResolvedValue([])

    await GET(makeRequest("GET"))

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    )
  })
})

// ── POST /api/customers ───────────────────────────────────────────────────────
describe("POST /api/customers", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(makeRequest("POST", { name: "João" }))
    expect(res.status).toBe(401)
  })

  it("retorna 422 quando nome está ausente", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await POST(makeRequest("POST", { email: "joao@email.com" }))
    expect(res.status).toBe(422)
  })

  it("retorna 422 quando nome tem menos de 2 caracteres", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await POST(makeRequest("POST", { name: "J" }))
    expect(res.status).toBe(422)
  })

  it("retorna 422 quando e-mail é inválido", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await POST(makeRequest("POST", { name: "João", email: "invalido" }))
    expect(res.status).toBe(422)
  })

  it("cria cliente e retorna 201", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockCreate.mockResolvedValue({ ...CUSTOMER, id: "c-new" })

    const res = await POST(makeRequest("POST", { name: "João Silva", email: "joao@email.com" }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.name).toBe("João Silva")
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "João Silva" }) })
    )
  })
})

// ── PUT /api/customers/[id] ───────────────────────────────────────────────────
describe("PUT /api/customers/[id]", () => {
  const params = Promise.resolve({ id: "c1" })

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(makeRequest("PUT", { name: "João" }), { params })
    expect(res.status).toBe(401)
  })

  it("retorna 422 quando body é inválido", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await PUT(makeRequest("PUT", { name: "J" }), { params })
    expect(res.status).toBe(422)
  })

  it("atualiza cliente e retorna 200", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockUpdate.mockResolvedValue({ ...CUSTOMER, name: "João Atualizado" })

    const res = await PUT(makeRequest("PUT", { name: "João Atualizado" }), { params })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.name).toBe("João Atualizado")
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "c1" } })
    )
  })
})

// ── DELETE /api/customers/[id] ────────────────────────────────────────────────
describe("DELETE /api/customers/[id]", () => {
  const params = Promise.resolve({ id: "c1" })

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await DELETE(makeRequest("DELETE"), { params })
    expect(res.status).toBe(401)
  })

  it("deleta cliente e retorna { ok: true }", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDelete.mockResolvedValue({ id: "c1" })

    const res = await DELETE(makeRequest("DELETE"), { params })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual({ ok: true })
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "c1" } })
  })
})
