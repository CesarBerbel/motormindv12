.PHONY: help dev stop logs build test superuser migrate db-studio clean

# Exibe ajuda
help:
	@echo ""
	@echo "  MotorMind — Comandos disponíveis"
	@echo "  ─────────────────────────────────"
	@echo "  make dev          Inicia ambiente de desenvolvimento (Docker)"
	@echo "  make stop         Para os containers"
	@echo "  make logs         Mostra logs do app em tempo real"
	@echo "  make build        Builda imagem de produção"
	@echo "  make test         Roda todos os testes"
	@echo "  make superuser    Cria o primeiro superusuário"
	@echo "  make migrate      Roda migrações de banco"
	@echo "  make db-studio    Abre Prisma Studio"
	@echo "  make clean        Remove containers e volumes"
	@echo ""

# Desenvolvimento
dev:
	docker compose up --build -d
	@echo "✓ App: http://localhost:3000"
	@echo "✓ MailHog: http://localhost:8026"

stop:
	docker compose down

logs:
	docker compose logs -f app

# Produção
build:
	docker build -t motormind:latest -f Dockerfile .

# Testes
test:
	docker compose exec app npm run test

# Superusuário
superuser:
	docker compose exec app npm run superuser

# Banco
migrate:
	docker compose exec app npx prisma migrate dev

db-studio:
	docker compose exec app npx prisma studio

# Limpeza
clean:
	docker compose down -v --remove-orphans
	docker rmi motormind:latest 2>/dev/null || true
