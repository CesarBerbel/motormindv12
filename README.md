# MotorMind

Plataforma web moderna com autenticação segura, dashboard interativo e deploy
automatizado em VPS via GitHub Actions + Docker.

## Início rápido

```bash
cp .env.example .env.local
make dev          # Sobe app + PostgreSQL + MailHog
make superuser    # Cria o primeiro admin (interativo)
```

- **App:** http://localhost:3000
- **E-mails (dev):** http://localhost:8025

## Documentação

Toda a documentação técnica está em [doc/README.md](doc/README.md).

## Tecnologias

Next.js 15 · TypeScript · PostgreSQL · Prisma · Auth.js v5 · Tailwind CSS · Docker · GitHub Actions
