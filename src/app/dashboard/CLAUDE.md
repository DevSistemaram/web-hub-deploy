# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/app/dashboard/ — Área Protegida

Todas as rotas aqui são protegidas. A guarda de autenticação vive no `layout.tsx` desta pasta.

### layout.tsx — Guard + Sidebar

`'use client'` — verifica `isAuthenticated()` no `useEffect`. Se não autenticado, redireciona para `/login`. Renderiza:

- Sidebar com links de navegação (📊 Overview, 🔗 Integrações, 🔑 Token ERP)
- Link ativo destacado via comparação com `usePathname()`
- Footer da sidebar: nome/email do usuário + botão de logout (chama `clearToken()` → redireciona para `/login`)

**Importante:** A verificação de auth é client-side (MVP). O middleware em `src/app/middleware.ts` é passthrough — não há proteção server-side.

### page.tsx — Dashboard Overview

Carrega `api.integrations.list()` no mount e exibe três cards de status (Mercado Livre, Shopee, Token ERP). Se alguma integração estiver desconectada, exibe alerta com link para `/dashboard/integrations`. Usa um sub-componente inline `StatusCard` (não exportado).

### Subpastas

- `integrations/` — Gerenciamento de conexões OAuth com marketplaces
- `settings/` — Geração e revogação de tokens ERP
