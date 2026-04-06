# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/app/(auth)/ — Route Group de Autenticação

Route group do Next.js (parênteses = sem segmento de URL). Rotas aqui ficam acessíveis em `/login` e `/register`, não em `/auth/login`.

### Páginas

- **`login/page.tsx`** — Wrapper estático que renderiza `<LoginForm />` dentro de um card centralizado
- **`register/page.tsx`** — Mesmo padrão; renderiza `<RegisterForm />`

### Intenção do grupo

Organização: separa páginas públicas de autenticação das rotas protegidas do dashboard. Não possui `layout.tsx` próprio, então herda diretamente o root layout (`src/app/layout.tsx`).

### Toda a lógica de formulário está nos componentes

As páginas aqui são apenas shells. Para modificar validação, chamadas de API ou comportamento pós-login, edite os componentes em `src/components/auth/`.
