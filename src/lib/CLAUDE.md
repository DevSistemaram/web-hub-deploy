# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/lib/ — Utilitários Compartilhados

### api.ts — Cliente de API Centralizado

Único ponto de acesso ao backend. Todas as chamadas da aplicação passam por aqui.

**Base URL:** `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'`

**Função `request<T>(path, options?)`:**
- Adiciona `Authorization: Bearer <token>` se token existir
- Sempre envia `Content-Type: application/json`
- Lança erro com mensagem do backend em caso de `!response.ok`
- Seguro para SSR: `typeof window` check antes de acessar localStorage

**Namespaces do objeto `api`:**

| Namespace | Método | Endpoint |
|-----------|--------|----------|
| `api.auth` | `register(data)` | POST `/api/auth/register` |
| `api.auth` | `login(data)` | POST `/api/auth/login` |
| `api.integrations` | `list()` | GET `/api/integrations` |
| `api.integrations` | `getMlAuthUrl()` | GET `/api/integrations/mercadolivre/auth-url` |
| `api.integrations` | `getShopeeAuthUrl()` | GET `/api/integrations/shopee/auth-url` |
| `api.integrations` | `handleMlCallback(code)` | POST `/api/integrations/mercadolivre/callback` |
| `api.integrations` | `handleShopeeCallback(code, shop_id)` | POST `/api/integrations/shopee/callback` |
| `api.settings` | `getErpTokens()` | GET `/api/settings/erp-token` |
| `api.settings` | `generateErpToken(label?)` | POST `/api/settings/erp-token` |
| `api.settings` | `revokeErpToken(id)` | DELETE `/api/settings/erp-token/{id}` |

Respostas autenticadas e não autenticadas retornam via `auth.register` e `auth.login`: `{ token: string, user: { name, email } }`.

---

### auth.ts — Estado de Autenticação (MVP)

Helpers para leitura/escrita do JWT no localStorage. Todos fazem `typeof window` check para segurança em SSR.

| Função | Descrição |
|--------|-----------|
| `saveToken(token, user)` | Persiste `hub_token` e `hub_user` (JSON) no localStorage |
| `clearToken()` | Remove `hub_token` e `hub_user` — usado no logout |
| `getUser()` | Parse seguro de `hub_user`; retorna `null` em caso de erro |
| `isAuthenticated()` | `!!localStorage.getItem('hub_token')` |

**Limitações MVP documentadas:**
- Sem expiração de token / refresh
- Sem httpOnly cookies (vulnerável a XSS)
- `hub_user` pode ficar desatualizado (não é revalidado contra o backend)
