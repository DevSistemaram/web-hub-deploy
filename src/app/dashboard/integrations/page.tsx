'use client';

import { useEffect, useState } from 'react';
import { Pencil, Check, X, Unplug, Plus, ShoppingCart, ShoppingBag } from 'lucide-react';
import { api, Integration } from '@/lib/api';
import { confirm, toastError } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MARKETPLACE_META: Record<'mercadolivre' | 'shopee', { name: string; icon: React.ElementType }> = {
  mercadolivre: { name: 'Mercado Livre', icon: ShoppingCart },
  shopee: { name: 'Shopee', icon: ShoppingBag },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadIntegrations() {
    try {
      setIntegrations(await api.integrations.list());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadIntegrations(); }, []);

  async function connectMercadoLivre() {
    try {
      const { url, codeVerifier } = await api.integrations.getMlAuthUrl();
      sessionStorage.setItem('ml_code_verifier', codeVerifier);
      window.location.href = url;
    } catch { toastError('Erro ao obter URL do Mercado Livre'); }
  }

  async function connectShopee() {
    try {
      const { url } = await api.integrations.getShopeeAuthUrl();
      window.location.href = url;
    } catch { toastError('Erro ao obter URL da Shopee'); }
  }

  async function handleDeactivate(id: string) {
    if (!await confirm('A integração será desconectada e você precisará reconectar para usá-la novamente.', { title: 'Desconectar integração?', confirmText: 'Desconectar', danger: true })) return;
    try {
      await api.integrations.deactivate(id);
      await loadIntegrations();
    } catch { toastError('Erro ao desconectar'); }
  }

  async function handleNicknameUpdate(id: string, nickname: string) {
    try {
      await api.integrations.updateNickname(id, nickname);
      setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, nickname } : i)));
    } catch { toastError('Erro ao salvar nome'); }
  }

  const mlIntegrations = integrations.filter((i) => i.marketplace === 'mercadolivre');
  const shopeeIntegrations = integrations.filter((i) => i.marketplace === 'shopee');

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Integrações</h1>
      <p className="text-muted-foreground mb-8">
        Vincule suas lojas dos marketplaces. Você pode ter múltiplas lojas do mesmo marketplace.
      </p>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-6 w-40 mb-3" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <MarketplaceSection
            marketplace="mercadolivre"
            integrations={mlIntegrations}
            onConnect={connectMercadoLivre}
            onDeactivate={handleDeactivate}
            onNicknameUpdate={handleNicknameUpdate}
          />
          <MarketplaceSection
            marketplace="shopee"
            integrations={shopeeIntegrations}
            onConnect={connectShopee}
            onDeactivate={handleDeactivate}
            onNicknameUpdate={handleNicknameUpdate}
          />
        </div>
      )}
    </div>
  );
}

function MarketplaceSection({
  marketplace, integrations, onConnect, onDeactivate, onNicknameUpdate,
}: {
  marketplace: 'mercadolivre' | 'shopee';
  integrations: Integration[];
  onConnect: () => void;
  onDeactivate: (id: string) => void;
  onNicknameUpdate: (id: string, nickname: string) => void;
}) {
  const { name, icon: Icon } = MARKETPLACE_META[marketplace];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">{name}</h2>
          {integrations.length > 0 && (
            <Badge variant="success">
              {integrations.length} {integrations.length === 1 ? 'loja' : 'lojas'}
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={onConnect}>
          <Plus className="w-3.5 h-3.5" /> Conectar nova loja
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhuma loja conectada. Clique em "Conectar nova loja" para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {integrations.map((i) => (
            <IntegrationRow
              key={i.id}
              integration={i}
              onDeactivate={onDeactivate}
              onNicknameUpdate={onNicknameUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationRow({ integration, onDeactivate, onNicknameUpdate }: {
  integration: Integration;
  onDeactivate: (id: string) => void;
  onNicknameUpdate: (id: string, nickname: string) => void;
}) {
  const externalId = integration.shopId ?? integration.sellerId ?? integration.id.slice(0, 8);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(integration.nickname ?? '');
  const [saving, setSaving] = useState(false);

  async function saveNickname() {
    if (!draft.trim()) return;
    setSaving(true);
    await onNicknameUpdate(integration.id, draft.trim());
    setSaving(false);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveNickname();
    if (e.key === 'Escape') { setDraft(integration.nickname ?? ''); setEditing(false); }
  }

  return (
    <Card>
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                placeholder="Nome da loja"
              />
              <Button size="icon" variant="ghost" onClick={saveNickname} disabled={saving || !draft.trim()} className="h-8 w-8 text-primary">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => { setDraft(integration.nickname ?? ''); setEditing(false); }} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {integration.nickname || `ID: ${externalId}`}
              </span>
              <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <Badge variant="success">Ativo</Badge>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            ID: <code className="font-mono">{externalId}</code>
            {' · '}Conectado em {new Date(integration.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDeactivate(integration.id)}
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
        >
          <Unplug className="w-3.5 h-3.5" /> Desconectar
        </Button>
      </CardContent>
    </Card>
  );
}
