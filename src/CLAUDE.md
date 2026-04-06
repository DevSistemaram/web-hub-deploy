# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/ — Source Root

Contém todo o código da aplicação Next.js. Organizado em três subdiretórios principais:

- `app/` — Páginas e layouts usando o App Router do Next.js 15
- `components/` — Componentes React reutilizáveis (sem framework de UI)
- `lib/` — Utilitários compartilhados: cliente de API e helpers de autenticação

### Convenções desta pasta

- Todos os componentes interativos usam `'use client'`
- Alias de path: `@/*` aponta para `src/*`
- Idioma da interface: português brasileiro (pt-BR)
- Estilização exclusivamente via Tailwind CSS com paleta de marca personalizada (`brand-*`)
- Nenhum gerenciador de estado global — estado local via `useState`/`useEffect`
