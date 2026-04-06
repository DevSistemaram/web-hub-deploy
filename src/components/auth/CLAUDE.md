# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/components/auth/ — Formulários de Autenticação

### LoginForm.tsx

Estado: `{ email, password }`, `error: string`, `loading: boolean`

Fluxo no submit:
1. `api.auth.login({ email, password })`
2. `saveToken(token, user)` → salva em localStorage
3. `router.push('/dashboard')`
4. Em erro: exibe mensagem em caixa vermelha (fallback: "Credenciais inválidas")

### RegisterForm.tsx

Idêntico ao LoginForm com adição do campo `name` e `minLength=8` no password.

1. `api.auth.register({ name, email, password })`
2. Mesmo fluxo de `saveToken` + redirect para `/dashboard`

### Padrões compartilhados

- Inputs controlados com `onChange: e => setForm(f => ({ ...f, [field]: e.target.value }))`
- Botão submit desabilitado durante `loading`
- Link cruzado: LoginForm aponta para `/register`, RegisterForm aponta para `/login`
- Nenhuma validação client-side além do HTML nativo (`required`, `minLength`, `type="email"`)
