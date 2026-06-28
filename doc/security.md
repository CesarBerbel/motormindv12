# Segurança — MotorMind

## Autenticação

| Mecanismo | Implementação |
|-----------|---------------|
| Sessão | JWT em cookie `HttpOnly; Secure; SameSite=Lax` via Auth.js v5 |
| Senha | bcrypt com `saltRounds=12` |
| Token de reset | `crypto.randomBytes(32)` — 256 bits de entropia |
| Expiração do reset | 1 hora |
| Invalidação de tokens | Tokens anteriores são marcados como usados ao emitir novo |

## Proteção de rotas

- `src/middleware.ts` — intercepta todas as rotas não-públicas via `auth()` do Auth.js
- Rotas protegidas: `/dashboard/**`
- Rotas de auth (`/login`, `/forgot-password`) redirecionam usuários já autenticados para `/dashboard`

## Rate Limiting

Endpoint `POST /api/auth/forgot-password` aplica rate limiting por IP:
- `RATE_LIMIT_MAX=10` requisições
- Janela de `RATE_LIMIT_WINDOW=60000ms` (1 minuto)
- Resposta `429 Too Many Requests` quando excedido

## HTTP Headers de segurança

Configurados em `next.config.ts` e no Nginx:

| Header | Valor |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | restrito a `self` |
| `Permissions-Policy` | câmera/microfone/geolocalização bloqueados |

## Prevenção de user enumeration

O endpoint `POST /api/auth/forgot-password` retorna **sempre a mesma resposta**
independente de o e-mail existir ou não no banco, prevenindo que atacantes descubram
quais e-mails estão cadastrados.

## Boas práticas de código

- **Validação com Zod** em todas as entradas de API
- **Prepared statements** via Prisma ORM (prevenção de SQL injection)
- **`active: true`** verificado no login (usuários desativados não conseguem entrar)
- **`poweredByHeader: false`** no Next.js (não expõe framework/versão)
- **Docker non-root**: usuário `nextjs` (UID 1001) executa o app
- **Banco não exposto** em produção (porta não mapeada para o host)
- **Secrets** somente via variáveis de ambiente (nunca hardcoded)
- **`.gitignore`** inclui todos os arquivos `.env*`

## Checklist de produção

- [ ] `NEXTAUTH_SECRET` gerado com `openssl rand -base64 32`
- [ ] Banco com senha forte (não `motormind`)
- [ ] SSL/TLS ativo (Let's Encrypt)
- [ ] `robots.txt` com `Disallow: /dashboard` (se necessário)
- [ ] Firewall na VPS: porta 5432 (PostgreSQL) bloqueada externamente
- [ ] SSH: desabilitar autenticação por senha, usar somente chave
- [ ] Alertas de `npm audit` no CI passando sem vulnerabilidades high/critical
- [ ] Backup automático do volume PostgreSQL configurado

## Relatório de vulnerabilidades

Para reportar uma vulnerabilidade de segurança, envie um e-mail para
`security@motormind.com` — **não** abra issues públicas.
