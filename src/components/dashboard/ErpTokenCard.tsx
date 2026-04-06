import { KeyRound, ShoppingCart, ShoppingBag } from 'lucide-react';
import { ErpToken, Integration } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MARKETPLACE_ICON: Record<string, React.ElementType> = {
  mercadolivre: ShoppingCart,
  shopee: ShoppingBag,
};

interface ErpTokenCardProps {
  token: ErpToken;
  integrations: Integration[];
  onRevoke: () => void;
}

export function ErpTokenCard({ token, integrations, onRevoke }: ErpTokenCardProps) {
  const preview =
    token.tokenPreview.length > 20
      ? `${token.tokenPreview.slice(0, 14)}...${token.tokenPreview.slice(-6)}`
      : token.tokenPreview;

  const scopedIntegrations = token.scopedIntegrationIds.length > 0
    ? integrations.filter((i) => token.scopedIntegrationIds.includes(i.id))
    : null;

  return (
    <Card className={!token.isActive ? 'opacity-50' : ''}>
      <CardContent className="py-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex gap-3">
          <KeyRound className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">{token.label}</span>
              <Badge variant={token.isActive ? 'success' : 'muted'}>
                {token.isActive ? 'Ativo' : 'Revogado'}
              </Badge>
            </div>
            <code className="text-xs text-muted-foreground font-mono mt-1 block">{preview}</code>
            <p className="text-xs text-muted-foreground mt-0.5">
              Criado em {new Date(token.createdAt).toLocaleDateString('pt-BR')}
              {token.lastUsedAt && ` · Último uso: ${new Date(token.lastUsedAt).toLocaleDateString('pt-BR')}`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {scopedIntegrations === null ? (
                <span className="text-xs text-muted-foreground italic">Acesso a todas as integrações</span>
              ) : scopedIntegrations.map((i) => {
                const Icon = MARKETPLACE_ICON[i.marketplace];
                return (
                  <Badge key={i.id} variant="secondary" className="gap-1">
                    <Icon className="w-3 h-3" />
                    {i.nickname || i.shopId || i.sellerId || i.id.slice(0, 8)}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        {token.isActive && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRevoke}
            className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Revogar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
