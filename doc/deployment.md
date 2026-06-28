# Deploy — VPS com Nginx existente

## Visão geral

O MotorMind roda em Docker Compose na VPS. O Nginx já instalado na VPS atua como
reverse proxy, adicionando um novo `server block` para o domínio do MotorMind sem
afetar os sites já em operação.

```
Internet → Nginx (80/443) → Docker (porta 3000) → Next.js App → PostgreSQL
```

---

## 1. Preparar a VPS

### 1.1 Criar usuário de deploy

```bash
# Como root na VPS
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Copiar chave SSH (do seu PC)
ssh-copy-id deploy@SEU_VPS_IP
```

### 1.2 Criar diretório do app

```bash
mkdir -p /opt/motormind
chown deploy:deploy /opt/motormind
```

### 1.3 Copiar arquivos de produção para a VPS

```bash
# Do seu PC local
scp docker-compose.prod.yml deploy@SEU_VPS_IP:/opt/motormind/
scp .env.production deploy@SEU_VPS_IP:/opt/motormind/.env
```

Conteúdo mínimo do `.env` na VPS:

```env
DATABASE_URL=postgresql://motormind:SENHA_FORTE@db:5432/motormind
NEXTAUTH_URL=https://SEU_DOMINIO.com
NEXTAUTH_SECRET=<openssl rand -base64 32>
POSTGRES_USER=motormind
POSTGRES_PASSWORD=SENHA_FORTE
POSTGRES_DB=motormind
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=noreply@seudominio.com
SMTP_PASS=SMTP_PASSWORD
SMTP_FROM="MotorMind <noreply@seudominio.com>"
```

---

## 2. Configurar Nginx na VPS

### 2.1 Copiar o virtual host

```bash
# Do seu PC local
scp docker/nginx/motormind.conf root@SEU_VPS_IP:/etc/nginx/sites-available/motormind

# Na VPS
# Editar com seu domínio real:
nano /etc/nginx/sites-available/motormind
# Substitua TODAS as ocorrências de "SUBSTITUA_PELO_SEU_DOMINIO.com"

# Ativar
ln -s /etc/nginx/sites-available/motormind /etc/nginx/sites-enabled/

# Testar
nginx -t

# Recarregar
nginx -s reload
```

### 2.2 SSL com Let's Encrypt (Certbot)

```bash
# Instalar certbot (se não tiver)
apt install certbot python3-certbot-nginx -y

# Obter certificado
certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com \
  --email seu@email.com --agree-tos --non-interactive

# Renovação automática já é configurada pelo certbot
# Verificar: certbot renew --dry-run
```

---

## 3. Primeiro deploy manual

```bash
# Na VPS, como usuário deploy
cd /opt/motormind

# Fazer login no GitHub Container Registry
echo "SEU_GITHUB_TOKEN" | docker login ghcr.io -u SEU_GITHUB_USER --password-stdin

# Subir containers
docker compose -f docker-compose.prod.yml up -d

# Rodar migrations
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# Criar superusuário
docker compose -f docker-compose.prod.yml exec app npm run superuser

# Verificar
curl https://SEU_DOMINIO.com/api/health
```

---

## 4. CI/CD automático (GitHub Actions)

### Secrets necessários no GitHub

Acesse: `Settings → Secrets and variables → Actions`

| Secret          | Valor                                       |
|-----------------|---------------------------------------------|
| `VPS_HOST`      | IP ou hostname da VPS                       |
| `VPS_USER`      | `deploy`                                    |
| `VPS_SSH_KEY`   | Chave privada SSH (conteúdo do `~/.ssh/id_rsa`) |
| `VPS_SSH_PORT`  | `22` (padrão)                               |
| `VPS_APP_DIR`   | `/opt/motormind`                            |

### Environment de produção

Crie o environment `production` em `Settings → Environments` e adicione os
secrets de autenticação se quiser aprovação manual antes de cada deploy.

### Fluxo

```
push → main
  └── CI (lint, tests, build, e2e)
        └── Deploy workflow
              └── Build + push imagem → ghcr.io
                    └── SSH no VPS → pull + restart + migrate
```

---

## 5. Rollback

```bash
# Listar imagens disponíveis
docker images ghcr.io/SEU_ORG/motormind

# Fazer rollback para SHA específico
cd /opt/motormind
export APP_IMAGE=ghcr.io/SEU_ORG/motormind:SHA_ANTERIOR
docker compose -f docker-compose.prod.yml up -d --no-deps app
```

---

## 6. Monitoramento básico

```bash
# Status dos containers
docker compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker compose -f docker-compose.prod.yml logs -f app

# Uso de recursos
docker stats

# Health endpoint
watch -n 5 "curl -s https://SEU_DOMINIO.com/api/health | python3 -m json.tool"
```
