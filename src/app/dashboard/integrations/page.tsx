'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pencil, Check, X, Unplug, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api, Integration } from '@/lib/api';
import { confirm, toastError, toastSuccess } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Marketplace = Integration['marketplace'];

const MARKETPLACE_META: Record<Marketplace, { name: string; image?: string; icon?: React.ElementType }> = {
  mercadolivre: { name: 'Mercado Livre', image: '/mercado_livre.svg' },
  shopee: { name: 'Shopee', image: '/shopee.svg' },
  ideris: { name: 'Ideris', image: '/ideris.svg' },
  nuvemshop: { name: 'Nuvemshop', image: '/nuvemshop.svg' },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIderisModal, setShowIderisModal] = useState(false);

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

  async function connectNuvemshop() {
    try {
      const { url } = await api.integrations.getNuvemshopAuthUrl();
      window.location.href = url;
    } catch { toastError('Erro ao obter URL da Nuvemshop'); }
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
  const iderisIntegrations = integrations.filter((i) => i.marketplace === 'ideris');
  const nuvemshopIntegrations = integrations.filter((i) => i.marketplace === 'nuvemshop');

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Integrações</h1>
      <p className="text-muted-foreground mb-8">
        Vincule suas lojas dos marketplaces. Você pode ter múltiplas lojas do mesmo marketplace.
      </p>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
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
          <MarketplaceSection
            marketplace="nuvemshop"
            integrations={nuvemshopIntegrations}
            onConnect={connectNuvemshop}
            onDeactivate={handleDeactivate}
            onNicknameUpdate={handleNicknameUpdate}
          />
          <MarketplaceSection
            marketplace="ideris"
            integrations={iderisIntegrations}
            onConnect={() => setShowIderisModal(true)}
            onDeactivate={handleDeactivate}
            onNicknameUpdate={handleNicknameUpdate}
          />
        </div>
      )}

      {showIderisModal && (
        <IderisModal
          onClose={() => setShowIderisModal(false)}
          onSuccess={() => { setShowIderisModal(false); loadIntegrations(); }}
        />
      )}
    </div>
  );
}

function MarketplaceSection({
  marketplace, integrations, onConnect, onDeactivate, onNicknameUpdate,
}: {
  marketplace: Marketplace;
  integrations: Integration[];
  onConnect: () => void;
  onDeactivate: (id: string) => void;
  onNicknameUpdate: (id: string, nickname: string) => void;
}) {
  const { name, image, icon: Icon } = MARKETPLACE_META[marketplace];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {image ? (
            <Image src={image} alt={name} width={20} height={20} className="w-5 h-5 object-contain" />
          ) : Icon ? (
            <Icon className="w-5 h-5 text-muted-foreground" />
          ) : null}
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
            Nenhuma loja conectada. Clique em &quot;Conectar nova loja&quot; para começar.
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

function IderisModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [token, setToken] = useState('');
  const [nickname, setNickname] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.integrations.connectIderis(token.trim(), nickname.trim() || undefined);
      toastSuccess('Ideris conectado com sucesso!');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar. Verifique o token e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Image src="/ideris.svg" alt="Ideris" width={20} height={20} className="w-5 h-5 object-contain" />
              <h2 className="text-lg font-semibold text-foreground">Conectar Ideris</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">Como gerar o token:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Crie um usuário em <span className="font-mono text-xs">Configuração &gt; Usuário</span> com perfil <strong>Integração</strong> (ou use um Administrador)</li>
              <li>Faça login com esse usuário</li>
              <li>Acesse <span className="font-mono text-xs">Configuração &gt; Integração &gt; Token de autenticação</span></li>
              <li>Cadastre o responsável técnico e gere o token</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Token de autenticação</label>
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole o token gerado no Ideris"
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Apelido <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Loja Principal"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !token.trim()}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Conectando...</> : 'Conectar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
