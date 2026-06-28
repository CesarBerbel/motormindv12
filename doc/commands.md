# Comandos — MotorMind

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Docker     | 24+           |
| Docker Compose | 2.20+    |
| Node.js    | 22+           |
| npm        | 10+           |

---

## Desenvolvimento (containers)

```bash
# Clonar e entrar no projeto
git clone <repo-url> motormind
cd motormind

# Copiar variáveis de ambiente
cp .env.example .env.local

# Subir toda a stack (app + PostgreSQL + MailHog)
make dev
# ou: docker compose up --build -d

# Verificar se tudo subiu
docker compose ps

# App:     http://localhost:3000
# MailHog: http://localhost:8025  (e-mails de dev)
# Banco:   localhost:5432
```

### Criar o primeiro superusuário

```bash
make superuser
# ou: docker compose exec app npm run superuser
```

> O script é interativo — pergunta email, nome e senha.
> Para uso não-interativo (CI/provisioning):
> ```bash
> SUPERUSER_EMAIL=admin@site.com \
> SUPERUSER_PASSWORD=Senha@Forte1 \
> SUPERUSER_NAME="Administrador" \
> docker compose exec -T app npm run superuser
> ```

---

## Banco de dados

```bash
# Criar nova migration após alterar schema.prisma
make migrate
# ou: docker compose exec app npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
docker compose exec app npx prisma migrate deploy

# Abrir Prisma Studio (GUI do banco)
make db-studio

# Resetar banco (CUIDADO: apaga tudo)
docker compose exec app npx prisma migrate reset
```

---

## Testes

```bash
# Unitários + integração (dentro do container)
make test
# ou: docker compose exec app npm test

# Cobertura de código
docker compose exec app npm run test:coverage

# E2E (Playwright) — requer app rodando
docker compose exec app npm run test:e2e

# Watch mode (desenvolvimento)
docker compose exec app npm run test:watch
```

---

## Build de produção

```bash
# Buildar imagem Docker de produção
make build
# ou: docker build -t motormind:latest -f Dockerfile .

# Testar imagem de produção localmente
docker run --env-file .env.local -p 3000:3000 motormind:latest
```

---

## Logs e diagnóstico

```bash
# Logs em tempo real
make logs
# ou: docker compose logs -f app

# Status dos containers
docker compose ps

# Health check
curl http://localhost:3000/api/health

# Entrar no container
docker compose exec app sh
```

---

## Limpeza

```bash
# Para e remove containers
make stop

# Remove containers + volumes (apaga banco local)
make clean
```

---

## Deploy manual no VPS

Ver [deployment.md](deployment.md) para o guia completo.

```bash
# Conexão SSH ao VPS
ssh deploy@SEU_VPS_IP

# No VPS, atualizar app manualmente
cd /opt/motormind
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
```
