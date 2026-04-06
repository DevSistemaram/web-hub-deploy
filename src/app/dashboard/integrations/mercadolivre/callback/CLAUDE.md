# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/app/dashboard/integrations/mercadolivre/callback/ — Callback OAuth Mercado Livre

### page.tsx

Handler do callback OAuth do Mercado Livre. URL de destino configurada no painel de desenvolvedor do ML.

**Query params esperados:** `?code={authorization_code}`

**Fluxo:**
1. Extrai `code` via `useSearchParams()`
2. Valida presença do code — exibe erro se ausente
3. Chama `api.integrations.handleMlCallback(code)` uma única vez (guarda com `useRef`)
4. Estados: `loading` → `success` (redireciona após 2s) ou `error` (botão de retry)

**Padrões importantes:**
- `useSearchParams()` exige `<Suspense>` — o componente principal é envolvido em `<Suspense fallback={spinner}>` no export default
- `useRef(called)` previne dupla execução em React StrictMode
- Diferença em relação ao callback da Shopee: recebe apenas `code`, sem `shop_id`
