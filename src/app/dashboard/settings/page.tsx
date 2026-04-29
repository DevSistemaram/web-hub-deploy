'use client';

import { useEffect, useState } from 'react';
import { Copy, Plus, KeyRound, ShoppingCart, ShoppingBag } from 'lucide-react';
import { api, Integration, ErpToken } from '@/lib/api';
import { toastError, toastInfo } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const MARKETPLACE_ICON: Record<string, React.ElementType> = {
  mercadolivre: ShoppingCart,
  shopee: ShoppingBag,
};

export default function SettingsPage() {
  const [tokens, setTokens] = useState<ErpToken[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<string[]>([]);

  async function loadData() {
    try {
      const [tokensData, integrationsData] = await Promise.all([
        api.settings.getErpTokens(),
        api.integrations.list(),
      ]);
      setTokens(tokensData);
      setIntegrations(integrationsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function toggleIntegration(id: string) {
    setSelectedIntegrationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await api.settings.generateErpToken(undefined, selectedIntegrationIds);
      setNewToken(result.token);
      setSelectedIntegrationIds([]);
      await loadData();
    } catch { toastError('Erro ao gerar token'); }
    finally { setGenerating(false); }
  }

  async function handleRevoke(id: string) {
    try {
      await api.settings.revokeErpToken(id);
      await loadData();
    } catch { toastError('Erro ao revogar token'); }
  }

  function getIntegrationLabel(integration: Integration) {
    return integration.nickname || integration.shopId || integration.sellerId || integration.id.slice(0, 8);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Token ERP</h1>
      <p className="text-muted-foreground mb-8">
        Gere o token de acesso para configurar no seu ERP. Use no header{' '}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Authorization: Bearer &lt;token&gt;</code>
      </p>

      {newToken && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 text-base">Token gerado com sucesso!</CardTitle>
            <CardDescription className="text-green-700">
              Copie agora — este token completo não será exibido novamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-green-200 rounded-md p-3 text-xs font-mono break-all text-foreground">
                {newToken}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(newToken); toastInfo('Token copiado!'); }}
                className="shrink-0 border-green-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {integrations.length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Escopo do token</CardTitle>
            <CardDescription>
              Selecione as integrações permitidas. Nenhuma selecionada = acesso a todas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {integrations.map((integration) => {
              const Icon = MARKETPLACE_ICON[integration.marketplace];
              return (
                <label
                  key={integration.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIntegrationIds.includes(integration.id)}
                    onChange={() => toggleIntegration(integration.id)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{getIntegrationLabel(integration)}</span>
                  <span className="text-xs text-muted-foreground capitalize">{integration.marketplace}</span>
                </label>
              );
            })}
            {selectedIntegrationIds.length > 0 ? (
              <p className="text-xs text-primary font-medium pt-1">
                {selectedIntegrationIds.length} integração(ões) selecionada(s)
              </p>
            ) : (
              <p className="text-xs text-muted-foreground pt-1">Acesso total a todas as integrações</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <Button onClick={handleGenerate} disabled={generating}>
          <Plus className="w-4 h-4" />
          {generating ? 'Gerando...' : 'Gerar novo token'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Gerar um novo token revoga o anterior automaticamente.
        </p>
      </div>

      <Separator className="mb-6" />

      <h2 className="text-sm font-semibold text-foreground mb-3">Tokens gerados</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : tokens.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum token gerado ainda.</p>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <ErpTokenCard
              key={token.id}
              token={token}
              integrations={integrations}
              onRevoke={() => handleRevoke(token.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ErpTokenCard({ token, integrations, onRevoke }: {
  token: ErpToken;
  integrations: Integration[];
  onRevoke: () => void;
}) {
  const preview = token.tokenPreview.length > 20
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
