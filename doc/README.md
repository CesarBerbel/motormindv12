# MotorMind — Documentação

Bem-vindo à documentação técnica do projeto MotorMind.

## Índice

| Documento | Descrição |
|-----------|-----------|
| [commands.md](commands.md) | Todos os comandos para dev, testes e deploy |
| [architecture.md](architecture.md) | Stack, estrutura de pastas e fluxos |
| [deployment.md](deployment.md) | Guia completo de deploy na VPS |
| [security.md](security.md) | Medidas de segurança implementadas |

## Início rápido (2 minutos)

```bash
# 1. Clonar
git clone <repo-url> && cd motormindv12

# 2. Variáveis de ambiente
cp .env.example .env.local

# 3. Subir tudo em Docker
make dev

# 4. Criar o primeiro admin
make superuser

# 5. Acessar
open http://localhost:3000
```

## Links rápidos

- App local: http://localhost:3000
- MailHog (e-mails dev): http://localhost:8025
- Health check: http://localhost:3000/api/health
