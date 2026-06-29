import { maskPhone, maskCNPJ, maskCEP, maskDocument } from "@/lib/masks"

describe("maskPhone", () => {
  it("retorna vazio para entrada vazia", () => {
    expect(maskPhone("")).toBe("")
  })

  it("formata número de 10 dígitos (fixo)", () => {
    expect(maskPhone("1123456789")).toBe("(11) 2345-6789")
  })

  it("formata número de 11 dígitos (celular)", () => {
    expect(maskPhone("11923456789")).toBe("(11) 92345-6789")
  })

  it("remove traço pendente em número incompleto", () => {
    expect(maskPhone("1112345")).toBe("(11) 1234-5")
    const result = maskPhone("112345")
    expect(result).not.toMatch(/-$/)
  })

  it("ignora caracteres não numéricos na entrada", () => {
    expect(maskPhone("(11) 92345-6789")).toBe("(11) 92345-6789")
  })

  it("limita ao máximo de 11 dígitos", () => {
    expect(maskPhone("119999999999")).toBe("(11) 99999-9999")
  })
})

describe("maskCNPJ", () => {
  it("retorna vazio para entrada vazia", () => {
    expect(maskCNPJ("")).toBe("")
  })

  it("formata CNPJ completo", () => {
    expect(maskCNPJ("12345678000195")).toBe("12.345.678/0001-95")
  })

  it("formata entrada parcial", () => {
    expect(maskCNPJ("123")).toBe("12.3")
    expect(maskCNPJ("12345678")).toBe("12.345.678")
    expect(maskCNPJ("123456789")).toBe("12.345.678/9")
  })

  it("ignora caracteres não numéricos", () => {
    expect(maskCNPJ("12.345.678/0001-95")).toBe("12.345.678/0001-95")
  })

  it("limita ao comprimento máximo de 18 caracteres", () => {
    expect(maskCNPJ("123456789012345678")).toHaveLength(18)
  })
})

describe("maskCEP", () => {
  it("retorna vazio para entrada vazia", () => {
    expect(maskCEP("")).toBe("")
  })

  it("formata CEP completo", () => {
    expect(maskCEP("01310100")).toBe("01310-100")
  })

  it("formata entrada parcial sem adicionar hífen prematuramente", () => {
    expect(maskCEP("0131")).toBe("0131")
    expect(maskCEP("013101")).toBe("01310-1")
  })

  it("ignora caracteres não numéricos", () => {
    expect(maskCEP("01310-100")).toBe("01310-100")
  })

  it("limita a 8 dígitos", () => {
    expect(maskCEP("012345678")).toBe("01234-567")
  })
})

describe("maskDocument", () => {
  describe("CPF (até 11 dígitos)", () => {
    it("formata CPF completo", () => {
      expect(maskDocument("12345678901")).toBe("123.456.789-01")
    })

    it("formata entrada parcial", () => {
      expect(maskDocument("123")).toBe("123")
      expect(maskDocument("1234")).toBe("123.4")
      expect(maskDocument("1234567")).toBe("123.456.7")
    })

    it("ignora caracteres não numéricos", () => {
      expect(maskDocument("123.456.789-01")).toBe("123.456.789-01")
    })

    it("limita a 14 caracteres formatados", () => {
      expect(maskDocument("12345678901")).toHaveLength(14)
    })
  })

  describe("CNPJ (mais de 11 dígitos)", () => {
    it("formata CNPJ completo", () => {
      expect(maskDocument("12345678000195")).toBe("12.345.678/0001-95")
    })

    it("detecta automaticamente CNPJ quando passa de 11 dígitos", () => {
      expect(maskDocument("123456789012")).toBe("12.345.678/9012")
    })

    it("ignora caracteres não numéricos", () => {
      expect(maskDocument("12.345.678/0001-95")).toBe("12.345.678/0001-95")
    })

    it("limita a 18 caracteres formatados", () => {
      expect(maskDocument("12345678000195")).toHaveLength(18)
    })
  })
})
