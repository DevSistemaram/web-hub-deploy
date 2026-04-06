# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/components/ — Componentes Reutilizáveis

Componentes React usados pelas páginas do App Router. Todos são `'use client'`.

### Subpastas

- `auth/` — Formulários de login e cadastro (contêm toda a lógica: state, validação, chamada de API)
- `dashboard/` — Cards para exibir integrações e tokens ERP

### Convenções

- Páginas em `src/app/` são shells; toda a lógica interativa fica nos componentes aqui
- Props tipadas com interfaces TypeScript inline (sem arquivo de tipos separado)
- Estilização via classes Tailwind diretamente nos JSX elements
- Sem biblioteca de componentes (Material UI, shadcn/ui, etc.) — tudo construído do zero
- Datas formatadas com `toLocaleDateString('pt-BR', { ... })`
