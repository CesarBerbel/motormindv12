const nextJest = require("next/jest")

const createJestConfig = nextJest({ dir: "./" })

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/unit/**/*.test.tsx",
    "<rootDir>/tests/integration/**/*.test.ts",
    "<rootDir>/tests/integration/**/*.test.tsx",
  ],
  // Cobertura restrita ao que testamos com Jest:
  // - src/app/api/**  → rotas (testadas com mocks de DB/auth)
  // - src/lib/**      → validações, máscaras, utilitários
  // Excluídos intencionalmente:
  // - src/components  → componentes React (testados via Playwright/E2E)
  // - src/app/**/page.tsx e layout.tsx → wrappers finos sem lógica
  // - src/app/api/auth → handler do NextAuth (internals da lib)
  // - src/lib/db.ts   → singleton do Prisma (sem lógica própria)
  // - src/lib/email.ts → integração SMTP (requer servidor externo)
  collectCoverageFrom: [
    "src/app/api/**/*.ts",
    "src/lib/**/*.ts",
    "!src/app/api/auth/**",
    "!src/lib/db.ts",
    "!src/lib/email.ts",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(config)
