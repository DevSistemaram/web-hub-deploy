# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/app/dashboard/settings/ — Tokens ERP

### page.tsx — Gerenciamento de Tokens ERP

Permite ao usuário gerar e revogar tokens JWT para integração com o ERP.

**Estado:**
- `tokens` — lista de tokens (preview truncado, não o valor completo)
- `newToken` — string do token gerado; populado só uma vez após geração, depois limpo
- `generating` — boolean para loading do botão de gerar

**Comportamento importante:**
- O token completo é exibido **somente uma vez** no banner de sucesso após geração (prática de segurança)
- Gerar novo token revoga automaticamente o anterior no backend
- Botão "Copiar" usa `navigator.clipboard.writeText(newToken)`

**API calls:**
- `api.settings.getErpTokens()` — lista tokens na montagem
- `api.settings.generateErpToken()` — gera novo token; retorna `{ token }` (valor completo)
- `api.settings.revokeErpToken(id)` — passado via `onRevoke` para cada `<ErpTokenCard />`

**Bloco de exemplo:**
A página inclui um código de exemplo mostrando como o ERP deve chamar a API com o token gerado, incluindo filtros opcionais (`?marketplace=`, `?status=`, `?page=`, `?limit=`).
