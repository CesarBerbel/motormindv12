/** @jest-environment node */
import { NextRequest } from "next/server"

// ── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("@/auth", () => ({ auth: jest.fn() }))
jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update:     jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))
jest.mock("bcryptjs", () => ({
  hash:    jest.fn().mockResolvedValue("$2b$12$hashed"),
  compare: jest.fn(),
}))

import { auth } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { GET, PUT } from "@/app/api/profile/route"
import { PUT as PUT_PASSWORD } from "@/app/api/profile/password/route"

const mockAuth        = auth              as jest.Mock
const mockFindUnique  = db.user.findUnique as jest.Mock
const mockUpdate      = db.user.update    as jest.Mock
const mockTransaction = db.$transaction   as jest.Mock
const mockBcryptCompare = bcrypt.compare  as jest.Mock

const SESSION = { user: { id: "user1", role: "ADMIN" } }

const PROFILE = {
  id: "user1", name: "Admin Silva", email: "admin@oficina.com",
  phone: "(11) 9999-9999", role: "ADMIN", specialty: null,
  createdAt: new Date(),
}

function makeRequest(method: string, body?: unknown) {
  return new NextRequest("http://localhost/api/profile", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

// ── GET /api/profile ──────────────────────────────────────────────────────────
describe("GET /api/profile", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("retorna perfil do usuário autenticado", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue(PROFILE)

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.name).toBe("Admin Silva")
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user1" } })
    )
  })
})

// ── PUT /api/profile ──────────────────────────────────────────────────────────
describe("PUT /api/profile", () => {
  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT(makeRequest("PUT", { name: "Novo Nome" }))
    expect(res.status).toBe(401)
  })

  it("retorna 422 quando nome tem menos de 2 caracteres", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await PUT(makeRequest("PUT", { name: "J" }))
    expect(res.status).toBe(422)
  })

  it("retorna 422 quando nome está ausente", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await PUT(makeRequest("PUT", {}))
    expect(res.status).toBe(422)
  })

  it("atualiza nome e telefone do perfil", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockUpdate.mockResolvedValue({ ...PROFILE, name: "Novo Nome", phone: "(11) 8888-8888" })

    const res = await PUT(makeRequest("PUT", { name: "Novo Nome", phone: "(11) 8888-8888" }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.name).toBe("Novo Nome")
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user1" },
        data: expect.objectContaining({ name: "Novo Nome", phone: "(11) 8888-8888" }),
      })
    )
  })

  it("define phone como null quando string vazia é enviada", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockUpdate.mockResolvedValue({ ...PROFILE, phone: null })

    await PUT(makeRequest("PUT", { name: "Admin", phone: "" }))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ phone: null }),
      })
    )
  })
})

// ── PUT /api/profile/password ─────────────────────────────────────────────────
describe("PUT /api/profile/password", () => {
  const VALID_BODY = {
    currentPassword: "SenhaAtual@1",
    newPassword: "NovaSenha@1",
    confirmPassword: "NovaSenha@1",
  }

  function makePasswordRequest(body?: unknown) {
    return new NextRequest("http://localhost/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  it("retorna 401 quando não autenticado", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await PUT_PASSWORD(makePasswordRequest(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it("retorna 422 quando schema é inválido (confirmação não confere)", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await PUT_PASSWORD(makePasswordRequest({ ...VALID_BODY, confirmPassword: "Diferente@1" }))
    expect(res.status).toBe(422)
  })

  it("retorna 422 quando nova senha é fraca", async () => {
    mockAuth.mockResolvedValue(SESSION)
    const res = await PUT_PASSWORD(makePasswordRequest({
      ...VALID_BODY, newPassword: "fraca", confirmPassword: "fraca",
    }))
    expect(res.status).toBe(422)
  })

  it("retorna 400 quando usuário não tem senha definida", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue({ password: null })

    const res = await PUT_PASSWORD(makePasswordRequest(VALID_BODY))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/sem senha/i)
  })

  it("retorna 400 quando senha atual está incorreta", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue({ password: "$2b$12$existingHash" })
    mockBcryptCompare.mockResolvedValue(false)

    const res = await PUT_PASSWORD(makePasswordRequest(VALID_BODY))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/incorreta/i)
  })

  it("troca senha e invalida sessões ativas", async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue({ password: "$2b$12$existingHash" })
    mockBcryptCompare.mockResolvedValue(true)
    mockTransaction.mockResolvedValue([{ id: "user1" }, { count: 1 }])

    const res = await PUT_PASSWORD(makePasswordRequest(VALID_BODY))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual({ ok: true })
    expect(mockTransaction).toHaveBeenCalled()
  })
})
