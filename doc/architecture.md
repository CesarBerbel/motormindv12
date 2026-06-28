# Arquitetura — MotorMind

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend + Backend | Next.js 15 (App Router) com TypeScript |
| Banco de dados | PostgreSQL 16 via Prisma ORM |
| Autenticação | Auth.js v5 (next-auth@5) com JWT em HttpOnly cookie |
| Estilização | Tailwind CSS 3 + Radix UI (componentes acessíveis) |
| Animações | Framer Motion |
| Validação | Zod |
| Formulários | React Hook Form + @hookform/resolvers |
| E-mail | Nodemailer |
| Containers | Docker + Docker Compose |
| Reverse proxy | Nginx (já existente na VPS) |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry (ghcr.io) |

## Estrutura de pastas

```
motormindv12/
├── .github/workflows/      # CI (ci.yml) e Deploy (deploy.yml)
├── doc/                    # Documentação do projeto
├── docker/nginx/           # Config do virtual host Nginx
├── prisma/
│   └── schema.prisma       # Schema do banco (User, Session, PasswordResetToken)
├── scripts/
│   └── create-superuser.ts # Script para criar admin
├── src/
│   ├── app/
│   │   ├── (auth)/         # Grupo de rotas: /login, /forgot-password
│   │   ├── (protected)/    # Grupo de rotas: /dashboard (requer auth)
│   │   ├── api/            # API Routes
│   │   │   ├── auth/[...nextauth]/  # Auth.js handlers
│   │   │   ├── auth/forgot-password/
│   │   │   └── health/
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page pública
│   ├── auth.ts             # Configuração central do Auth.js
│   ├── middleware.ts        # Proteção de rotas (executa no Edge)
│   ├── components/
│   │   ├── auth/           # LoginForm, ForgotPasswordForm
│   │   ├── layout/         # DashboardNav
│   │   └── ui/             # Design system (Button, Input, Label, Toaster)
│   ├── lib/
│   │   ├── db.ts           # Prisma client singleton
│   │   ├── email.ts        # Envio de e-mail via Nodemailer
│   │   ├── rate-limit.ts   # Rate limiter em memória
│   │   ├── utils.ts        # cn(), getBaseUrl(), formatDate()
│   │   └── validations.ts  # Schemas Zod
│   └── types/
│       └── next-auth.d.ts  # Extensão de tipos do Auth.js
├── tests/
│   ├── unit/               # Jest: validations, rate-limit
│   ├── integration/        # Jest: API routes com banco real
│   └── e2e/                # Playwright: fluxos completos no browser
├── Dockerfile              # Imagem de produção (multi-stage)
├── Dockerfile.dev          # Imagem de desenvolvimento
├── docker-compose.yml      # Stack local (app + db + mailhog)
├── docker-compose.prod.yml # Stack produção (app + db)
└── Makefile                # Atalhos para comandos comuns
```

## Fluxo de autenticação

```
Usuário acessa /login
  → preenche formulário (LoginForm.tsx)
  → POST /api/auth/callback/credentials (Auth.js)
  → authorize() em src/auth.ts
      → busca usuário no banco (Prisma)
      → verifica bcrypt hash
  → JWT gerado → cookie HttpOnly
  → middleware.ts verifica JWT em cada request
  → redirect para /dashboard
```

## Fluxo de recuperação de senha

```
Usuário acessa /forgot-password
  → preenche e-mail (ForgotPasswordForm.tsx)
  → POST /api/auth/forgot-password
      → rate limit por IP
      → busca usuário no banco
      → gera token seguro (crypto.randomBytes)
      → salva em password_reset_tokens (expira em 1h)
      → envia e-mail com link
  → /reset-password?token=... (a implementar)
      → valida token + expiração + não usado
      → bcrypt hash da nova senha
      → atualiza user.password
      → marca token como usado
```

## Modelos do banco

```
User
  id, name, email, password (bcrypt), role (USER|ADMIN), active, emailVerified
  → Account (OAuth providers)
  → Session (Auth.js)
  → PasswordResetToken

PasswordResetToken
  id, token (unique), userId, expiresAt, usedAt
```

## Containers em produção

```
VPS
├── Nginx (host, 80/443)
│   ├── site-existente.conf  → site já em operação (intocado)
│   └── motormind.conf       → proxy para localhost:3000
└── Docker network "motormind"
    ├── app (Next.js, porta interna 3000)
    └── db  (PostgreSQL, porta interna 5432, não exposta)
```
