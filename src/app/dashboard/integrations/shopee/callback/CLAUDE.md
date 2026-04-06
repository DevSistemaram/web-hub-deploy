# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/app/dashboard/integrations/shopee/callback/ — Callback OAuth Shopee

### page.tsx

Handler do callback OAuth da Shopee. Idêntico ao do Mercado Livre com uma diferença crítica.

**Query params esperados:** `?code={authorization_code}&shop_id={shop_id}`

**Diferença em relação ao ML callback:**
- Extrai dois parâmetros: `code` E `shop_id`
- Chama `api.integrations.handleShopeeCallback(code, shopId)` passando ambos
- Valida presença de ambos antes de prosseguir

**Padrões compartilhados com ML callback:**
- `<Suspense>` envolvendo o componente (obrigatório para `useSearchParams()`)
- `useRef(called)` para evitar dupla execução
- Mesmos três estados: `loading` → `success`/`error`
- Redirecionamento automático para `/dashboard/integrations` após 2s em caso de sucesso
