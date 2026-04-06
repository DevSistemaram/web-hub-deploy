# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/app/ — App Router (Next.js 15)

Contém todas as rotas da aplicação usando o App Router do Next.js.

### Estrutura de rotas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `page.tsx` | Landing page estática com CTAs |
| `/login` | `(auth)/login/page.tsx` | Página de login |
| `/register` | `(auth)/register/page.tsx` | Página de cadastro |
| `/dashboard` | `dashboard/page.tsx` | Overview com status das integrações |
| `/dashboard/integrations` | `dashboard/integrations/page.tsx` | Gerenciar conexões OAuth |
| `/dashboard/integrations/mercadolivre/callback` | `.../mercadolivre/callback/page.tsx` | Callback OAuth do Mercado Livre |
| `/dashboard/integrations/shopee/callback` | `.../shopee/callback/page.tsx` | Callback OAuth da Shopee |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | Gerenciar tokens ERP |

### Arquivos especiais

- **`layout.tsx`** — Root layout: define `lang="pt-BR"`, aplica `globals.css`, sem providers
- **`globals.css`** — Apenas as diretivas Tailwind + `body` com fundo cinza claro
- **`middleware.ts`** — Passthrough no MVP; comentários documentam o que deve ser implementado (auth server-side com httpOnly cookies)

### Padrão das páginas de rota

Páginas são wrappers simples que delegam lógica para componentes em `src/components/`. O layout do dashboard (`dashboard/layout.tsx`) centraliza a guarda de autenticação e a sidebar de navegação.

### Route group `(auth)/`

Parênteses impedem que `auth` apareça na URL. Usado puramente para organização — login e register compartilham o mesmo visual de card centralizado mas não têm layout compartilhado.
