# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/app/dashboard/integrations/ — Integrações OAuth

Gerencia conexões com marketplaces via OAuth2.

### page.tsx — Lista de Integrações

Carrega `api.integrations.list()` e renderiza um `<IntegrationCard />` para cada marketplace. O handler `onConnect` de cada card:

1. Chama `api.integrations.getMlAuthUrl()` ou `getShopeeAuthUrl()`
2. Redireciona via `window.location.href = url` (redirect full-page para o OAuth do marketplace)

A página também exibe uma caixa informativa com as URLs de callback que precisam ser registradas nos painéis de desenvolvedor dos marketplaces.

### Fluxo OAuth completo

```
Usuário clica "Conectar"
  → backend retorna URL de autorização
  → window.location.href → página do marketplace
  → usuário autoriza
  → marketplace redireciona para /dashboard/integrations/{marketplace}/callback?code=...
  → callback page chama backend handler
  → sucesso → redireciona para /dashboard/integrations após 2s
```

### Subpastas de callback

- `mercadolivre/callback/` — Recebe `?code=` do Mercado Livre
- `shopee/callback/` — Recebe `?code=` + `?shop_id=` da Shopee

Ambas usam `useRef(called)` para evitar chamada dupla ao backend em React StrictMode, e envolvem `useSearchParams()` em `<Suspense>` (obrigatório no App Router).
