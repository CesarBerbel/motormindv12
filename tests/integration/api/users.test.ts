/** @jest-environment node */
import { NextRequest } from "next/server"

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("@/auth", () => ({ auth: jest.fn() }))
jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findMany:  jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create:    jest.fn(),
      update:    jest.fn(),
    },
  },
}))
jest.mock("bcryptjs", () => ({
  hash:    jest.fn().mockResolvedValue("$2b$12$hashed"),
  compare: jest.fn(),
}))

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { GET, POST } from "@/app/api/users/route"
import { PUT, PATCH } from "@/app/api/users/[id]/route"

const mockAuth       = auth             as jest.Mock
const mockFindMany   = db.user.findMany  as jest.Mock
const mockFindUnique = db.user.findUnique as jest.Mock
const mockFindFirst  = db.user.findFirst as jest.Mock
const mockCreate     = db.user.create   as jest.Mock
const mockUpdate     = db.user.update   as jest.Mock

const ADMIN_SESSION   = { user: { id: "admin1", role: "ADMIN"     } }
const MANAGER_SESSION = { user: { id: "mgr1",   role: "MANAGER"   } }
const ATTEND_SESSION  = { user: { id: "att1",   role: "ATTENDANT" } }

const BASE_USER = {
  id: "user1", name: "João Silva", email: "joao@oficina.com",
  role: "ATTENDANT", specialty: null, phone: null, active: true,
  createdAt: new Date(),
}

const VALID_CREATE = {
  name: "Novo Usuário", email: "novo@oficina.com",
  password: "Senha@Forte1", role: "ATTENDANT",
}

function makeRequest(method: string, body?: unknown, url = "http://localhost/api/users") {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

// ── GET /api/users ────────────────────────────────────────────────────────────
describe("GET /api/users", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("retorna 403 para ATTENDANT", async () => {
    mockAuth.mockResolvedValue(ATTEND_SESSION)
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it("retorna lista de usuários para ADMIN", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindMany.mockResolvedValue([BASE_USER])

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe("João Silva")
  })

  it("retorna lista de usuários para MANAGER", async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    mockFindMany.mockResolvedValue([BASE_USER])

    const res = await GET()
    expect(res.status).toBe(200)
  })
})

// ── POST /api/users ───────────────────────────────────────────────────────────
describe("POST /api/users", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(makeRequest("POST", VALID_CREATE))
    expect(res.status).toBe(401)
  })

  it("retorna 403 para ATTENDANT", async () => {
    mockAuth.mockResolvedValue(ATTEND_SESSION)
    const res = await POST(makeRequest("POST", VALID_CREATE))
    expect(res.status).toBe(403)
  })

  it("retorna 403 quando MANAGER tenta criar ADMIN", async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    const res = await POST(makeRequest("POST", { ...VALID_CREATE, role: "ADMIN" }))
    expect(res.status).toBe(403)
  })

  it("retorna 422 quando body é inválido", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    const res = await POST(makeRequest("POST", { name: "J" }))
    expect(res.status).toBe(422)
  })

  it("retorna 409 quando e-mail já está cadastrado", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue({ id: "existing" })

    const res = await POST(makeRequest("POST", VALID_CREATE))
    expect(res.status).toBe(409)
  })

  it("cria usuário e retorna 201 com senha hasheada", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue(null) // e-mail não existe
    mockCreate.mockResolvedValue({ ...BASE_USER, name: "Novo Usuário" })

    const res = await POST(makeRequest("POST", VALID_CREATE))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.name).toBe("Novo Usuário")
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "novo@oficina.com",
          password: "$2b$12$hashed",
        }),
      })
    )
  })

  it("MANAGER pode criar usuário com role ATTENDANT", async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue(BASE_USER)

    const res = await POST(makeRequest("POST", VALID_CREATE))
    expect(res.status).toBe(201)
  })
})

// ── PUT /api/users/[id] ───────────────────────────────────────────────────────
describe("PUT /api/users/[id]", () => {
  const params = Promise.resolve({ id: "user1" })

  const VALID_UPDATE = {
    name: "João Atualizado", email: "joao@oficina.com",
    role: "ATTENDANT", active: true,
  }

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(makeRequest("PUT", VALID_UPDATE), { params })
    expect(res.status).toBe(401)
  })

  it("retorna 403 para ATTENDANT", async () => {
    mockAuth.mockResolvedValue(ATTEND_SESSION)
    const res = await PUT(makeRequest("PUT", VALID_UPDATE), { params })
    expect(res.status).toBe(403)
  })

  it("retorna 404 quando usuário não existe", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue(null)

    const res = await PUT(makeRequest("PUT", VALID_UPDATE), { params })
    expect(res.status).toBe(404)
  })

  it("retorna 403 quando MANAGER tenta editar ADMIN", async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    mockFindUnique.mockResolvedValue({ id: "user1", role: "ADMIN" })

    const res = await PUT(makeRequest("PUT", VALID_UPDATE), { params })
    expect(res.status).toBe(403)
  })

  it("retorna 400 quando usuário tenta se desativar", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION) // admin1 editando si mesmo
    mockFindUnique.mockResolvedValue({ id: "admin1", role: "ADMIN" })
    mockFindFirst.mockResolvedValue(null)

    const selfParams = Promise.resolve({ id: "admin1" })
    const res = await PUT(
      makeRequest("PUT", { ...VALID_UPDATE, active: false }),
      { params: selfParams }
    )
    expect(res.status).toBe(400)
  })

  it("retorna 409 quando e-mail já pertence a outro usuário", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue({ id: "user1", role: "ATTENDANT" })
    mockFindFirst.mockResolvedValue({ id: "other-user" }) // e-mail duplicado

    const res = await PUT(makeRequest("PUT", VALID_UPDATE), { params })
    expect(res.status).toBe(409)
  })

  it("atualiza usuário com sucesso", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue({ id: "user1", role: "ATTENDANT" })
    mockFindFirst.mockResolvedValue(null) // e-mail não duplicado
    mockUpdate.mockResolvedValue({ ...BASE_USER, name: "João Atualizado" })

    const res = await PUT(makeRequest("PUT", VALID_UPDATE), { params })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.name).toBe("João Atualizado")
  })
})

// ── PATCH /api/users/[id] (toggle ativo) ─────────────────────────────────────
describe("PATCH /api/users/[id]", () => {
  const params = Promise.resolve({ id: "user1" })

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PATCH(makeRequest("PATCH"), { params })
    expect(res.status).toBe(401)
  })

  it("retorna 400 quando tenta alterar o próprio status", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION) // admin1
    const selfParams = Promise.resolve({ id: "admin1" })
    const res = await PATCH(makeRequest("PATCH"), { params: selfParams })
    expect(res.status).toBe(400)
  })

  it("retorna 404 quando usuário não existe", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue(null)

    const res = await PATCH(makeRequest("PATCH"), { params })
    expect(res.status).toBe(404)
  })

  it("retorna 403 quando MANAGER tenta alterar status de ADMIN", async () => {
    mockAuth.mockResolvedValue(MANAGER_SESSION)
    mockFindUnique.mockResolvedValue({ active: true, role: "ADMIN" })

    const res = await PATCH(makeRequest("PATCH"), { params })
    expect(res.status).toBe(403)
  })

  it("inverte o status ativo do usuário", async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockFindUnique.mockResolvedValue({ active: true, role: "ATTENDANT" })
    mockUpdate.mockResolvedValue({ id: "user1", active: false })

    const res = await PATCH(makeRequest("PATCH"), { params })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.active).toBe(false)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } })
    )
  })
})
