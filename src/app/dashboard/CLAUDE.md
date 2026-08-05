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

Carrega `api.integrations.list()` no mount e exibe:
- Um card de status linkando para `/dashboard/integrations`, com a contagem de integrações ativas e um `Badge` por marketplace (verde se conectado, outline caso contrário), agrupados pelas mesmas categorias de `integrations/page.tsx` (Marketplace, Catálogo, Hubs, Food) — cobre os marketplaces suportados (`Integration['marketplace']` em `@/lib/api`), exceto `zedeliver` (Zé Delivery), que está marcado como "em breve" (`comingSoon: true` em `integrations/page.tsx`) e não aparece na Visão Geral.
- Uma seção "Atalhos" com `IconCard` (`@/components/ui/icon-card`) para Vendas, Integrações e Token ERP; o atalho Admin só aparece se `isAdmin()` (`@/lib/auth`) for `true`.

### Subpastas

- `integrations/` — Gerenciamento de conexões OAuth com marketplaces
- `settings/` — Geração e revogação de tokens ERP
