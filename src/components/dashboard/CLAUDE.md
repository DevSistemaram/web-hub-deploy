# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## src/components/dashboard/ — Cards do Dashboard

### IntegrationCard.tsx

Exibe status de uma integração com marketplace e botão de conexão.

**Props:**
```typescript
{
  name: string;
  icon: string;           // emoji, ex: "🛒"
  description: string;
  connected: boolean;
  connectedSince?: string; // ISO date string
  onConnect: () => void;  // dispara o fluxo OAuth
}
```

- Se `connected`: exibe badge verde "Conectado" + data formatada em pt-BR
- Se não conectado: exibe botão azul "Conectar" que chama `onConnect`
- Stateless — todo o estado e a chamada de API ficam na página `integrations/page.tsx`

### ErpTokenCard.tsx

Exibe um token ERP individual com opção de revogar.

**Props:**
```typescript
{
  token: {
    id: string;
    label: string;
    tokenPreview: string;  // versão truncada — nunca o token completo
    isActive: boolean;
    createdAt: string;
    lastUsedAt?: string | null;
  };
  onRevoke: () => void;
}
```

- Preview truncado adicionalmente no componente: `primeiro_14...ultimo_6` se `tokenPreview.length > 20`
- Token exibido em fonte monospace
- Token inativo: `opacity-60` no container inteiro
- Botão "Revogar" renderizado apenas se `isActive === true`
- Stateless — `onRevoke` gerencia o estado na página `settings/page.tsx`
