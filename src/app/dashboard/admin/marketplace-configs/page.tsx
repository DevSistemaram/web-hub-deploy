'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, RefreshCw, AlertTriangle, Clock, Copy } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { api, MarketplaceConfig, UpsertMarketplaceConfigPayload } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { toastError, toastSuccess } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SupportedMarketplace = 'shopee' | 'mercadolivre' | 'nuvemshop' | 'amazon';
type FoodPlatform = 'ifood' | 'zedeliver' | 'uairango';
// Plataformas de food configuráveis pelo admin (Zé fica como placeholder)
type ConfigurableFoodPlatform = 'ifood' | 'uairango';
type ConfigurableMarketplace = SupportedMarketplace | ConfigurableFoodPlatform;
const CONFIGURABLE_FOOD: ConfigurableFoodPlatform[] = ['ifood', 'uairango'];

const MARKETPLACE_META: Record<SupportedMarketplace, { label: string; image: string }> = {
  shopee: { label: 'Shopee', image: '/shopee.svg' },
  mercadolivre: { label: 'Mercado Livre', image: '/mercado_livre.svg' },
  nuvemshop: { label: 'Nuvemshop', image: '/nuvemshop.svg' },
  amazon: { label: 'Amazon', image: '/amazon.svg' },
};

function defaultRedirectUri(marketplace: MarketplaceConfig['marketplace']) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/dashboard/integrations/${marketplace}/callback`;
}

const FOOD_META: Record<FoodPlatform, { label: string; image: string }> = {
  ifood: { label: 'iFood', image: '/ifood.svg' },
  zedeliver: { label: 'Zé Delivery', image: '/ze_delivery.svg' },
  uairango: { label: 'UaiRango', image: '/uairango.svg' },
};

const TABS = [
  { id: 'marketplace', label: 'Marketplace', items: ['shopee', 'mercadolivre', 'amazon'] as SupportedMarketplace[] },
  { id: 'catalogo', label: 'Catálogo', items: ['nuvemshop'] as SupportedMarketplace[] },
  { id: 'food', label: 'Food', items: [] as SupportedMarketplace[] },
];

function partnerKeyStatus(expiresAt: string | null) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return { label: 'Chave vencida', variant: 'destructive' as const, icon: AlertTriangle };
  const days = Math.floor(diff / 86400000);
  if (days <= 30) return { label: `Vence em ${days}d`, variant: 'warning' as const, icon: AlertTriangle };
  return { label: `Válida por ${days}d`, variant: 'success' as const, icon: Clock };
}

export default function MarketplaceConfigsPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<MarketplaceConfig[]>([]);
  const [forms, setForms] = useState<Record<string, UpsertMarketplaceConfigPayload>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('marketplace');

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    load();
  }, [router]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.admin.listMarketplaceConfigs();
      setConfigs(data);
      const initial: Record<string, UpsertMarketplaceConfigPayload> = {};
      for (const c of data) {
        const isFood = c.marketplace === 'ifood' || c.marketplace === 'uairango';
        initial[c.marketplace] = {
          // Food usa direct grant (sem redirectUri); demais marketplaces são OAuth redirect
          ...(isFood ? {} : { redirectUri: c.redirectUri ?? defaultRedirectUri(c.marketplace) }),
          ...(c.marketplace === 'shopee' ? {
            partnerId: c.partnerId ?? '',
            env: c.env ?? 'sandbox',
            partnerKeyExpiresAt: c.partnerKeyExpiresAt ?? '',
          } : {}),
          ...(c.marketplace === 'mercadolivre' ? { appId: c.appId ?? '' } : {}),
          ...(c.marketplace === 'nuvemshop' ? { appId: c.appId ?? '' } : {}),
          ...(c.marketplace === 'amazon' ? { appId: c.appId ?? '', env: c.env ?? 'na', partnerId: c.partnerId ?? 'production' } : {}),
          ...(c.marketplace === 'ifood' ? { appId: c.appId ?? '' } : {}),
          ...(c.marketplace === 'uairango' ? { appId: c.appId ?? '', env: c.env ?? 'sandbox' } : {}),
        };
      }
      setForms(initial);
    } catch { /* silence */ }
    finally { setLoading(false); }
  }

  function update(marketplace: string, field: string, value: string) {
    setForms((prev) => ({
      ...prev,
      [marketplace]: { ...prev[marketplace], [field]: value },
    }));
  }

  async function handleCopyRedirectUri(mp: SupportedMarketplace) {
    try {
      await navigator.clipboard.writeText(defaultRedirectUri(mp));
      toastSuccess('Redirect URI copiada');
    } catch {
      toastError('Não foi possível copiar');
    }
  }

  function ifoodWebhookUrl() {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL
      || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}/api/food/ifood/webhook`;
  }

  async function handleCopyWebhookUrl() {
    try {
      await navigator.clipboard.writeText(ifoodWebhookUrl());
      toastSuccess('URL do webhook copiada');
    } catch {
      toastError('Não foi possível copiar');
    }
  }

  async function handleSave(marketplace: ConfigurableMarketplace) {
    setSaving(marketplace);
    try {
      await api.admin.upsertMarketplaceConfig(marketplace, forms[marketplace] ?? {});
      await load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuração das APIs</h1>
          <p className="text-muted-foreground text-sm">
            Credenciais de acesso às APIs dos marketplaces. Chaves secretas nunca são exibidas após salvar.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={load} title="Recarregar">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'food' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(FOOD_META) as FoodPlatform[]).map((mp) => {
            const { label, image } = FOOD_META[mp];

            // Zé Delivery: ainda não configurável pelo admin
            if (!CONFIGURABLE_FOOD.includes(mp as ConfigurableFoodPlatform)) {
              return (
                <Card key={mp}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Image src={image} alt={label} width={16} height={16} className="w-4 h-4 object-contain" />
                      {label}
                      <Badge variant="outline" className="ml-auto text-[10px]">Em breve</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Configurações globais em desenvolvimento.</p>
                  </CardContent>
                </Card>
              );
            }

            const foodMp = mp as ConfigurableFoodPlatform;
            const cfg = configs.find((c) => c.marketplace === foodMp);
            const form = forms[foodMp] ?? {};
            const isSaving = saving === foodMp;

            return (
              <Card key={mp}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Image src={image} alt={label} width={16} height={16} className="w-4 h-4 object-contain" />
                    {label}
                    {cfg?.isConfigured
                      ? (
                        <Badge variant="success" className="ml-auto text-[10px] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />Configurado
                        </Badge>
                      )
                      : <Badge variant="outline" className="ml-auto text-[10px]">Pendente</Badge>
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Client ID</label>
                    <Input
                      value={form.appId ?? ''}
                      onChange={(e) => update(foodMp, 'appId', e.target.value)}
                      placeholder="Cole o Client ID aqui"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Client Secret{cfg?.hasClientSecret && <span className="text-green-600 ml-1 font-normal">✓ salvo</span>}
                    </label>
                    <Input
                      type="password"
                      value={form.clientSecret ?? ''}
                      onChange={(e) => update(foodMp, 'clientSecret', e.target.value)}
                      placeholder={cfg?.hasClientSecret ? '••••••••' : 'Cole o secret aqui'}
                      className="h-8 text-sm"
                    />
                  </div>
                  {foodMp === 'uairango' && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Ambiente</label>
                      <select
                        value={form.env ?? 'sandbox'}
                        onChange={(e) => update(foodMp, 'env', e.target.value)}
                        className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Produção</option>
                      </select>
                    </div>
                  )}

                  {foodMp === 'ifood' && (
                    <>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">URL do Webhook</label>
                        <div className="flex gap-1">
                          <Input value={ifoodWebhookUrl()} readOnly className="h-8 text-sm" />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            title="Copiar URL do webhook"
                            onClick={() => handleCopyWebhookUrl()}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Cadastre esta URL no portal do iFood (app centralizado).
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Webhook Secret{cfg?.hasWebhookSecret && <span className="text-green-600 ml-1 font-normal">✓ salvo</span>}
                        </label>
                        <Input
                          type="password"
                          value={form.webhookSecret ?? ''}
                          onChange={(e) => update(foodMp, 'webhookSecret', e.target.value)}
                          placeholder={cfg?.hasWebhookSecret ? '••••••••' : 'Secret para validar a assinatura'}
                          className="h-8 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Vazio = usa o Client Secret (iFood assina com ele).
                        </p>
                      </div>
                    </>
                  )}

                  {cfg?.updatedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      Atualizado em {new Date(cfg.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="w-full"
                    disabled={isSaving}
                    onClick={() => handleSave(foodMp)}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentTab.items.map((mp) => {
            const cfg = configs.find((c) => c.marketplace === mp);
            const form = forms[mp] ?? {};
            const isSaving = saving === mp;
            const { label, image } = MARKETPLACE_META[mp];

            return (
              <Card key={mp}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Image src={image} alt={label} width={16} height={16} className="w-4 h-4 object-contain" />
                    {label}
                    {cfg?.isConfigured
                      ? (
                        <Badge variant="success" className="ml-auto text-[10px] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />Configurado
                        </Badge>
                      )
                      : <Badge variant="outline" className="ml-auto text-[10px]">Pendente</Badge>
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Redirect URI</label>
                    <div className="flex gap-1">
                      <Input
                        value={form.redirectUri ?? ''}
                        onChange={(e) => update(mp, 'redirectUri', e.target.value)}
                        placeholder="https://app.exemplo.com/callback"
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        title="Copiar Redirect URI gerada pelo sistema"
                        onClick={() => handleCopyRedirectUri(mp)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {mp === 'shopee' && (
                    <>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Partner ID</label>
                        <Input
                          value={form.partnerId ?? ''}
                          onChange={(e) => update(mp, 'partnerId', e.target.value)}
                          placeholder="12345678"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Partner Key{cfg?.hasPartnerKey && <span className="text-green-600 ml-1 font-normal">✓ salva</span>}
                        </label>
                        <Input
                          type="password"
                          value={form.partnerKey ?? ''}
                          onChange={(e) => update(mp, 'partnerKey', e.target.value)}
                          placeholder={cfg?.hasPartnerKey ? '••••••••' : 'Cole a chave aqui'}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Validade da Partner Key
                          {(() => {
                            const st = partnerKeyStatus(cfg?.partnerKeyExpiresAt ?? null);
                            if (!st) return null;
                            const StatusIcon = st.icon;
                            return (
                              <Badge variant={st.variant} className="ml-2 text-[10px] inline-flex items-center gap-0.5 py-0">
                                <StatusIcon className="w-3 h-3" />{st.label}
                              </Badge>
                            );
                          })()}
                        </label>
                        <Input
                          type="date"
                          value={form.partnerKeyExpiresAt ? form.partnerKeyExpiresAt.slice(0, 10) : ''}
                          onChange={(e) => update(mp, 'partnerKeyExpiresAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Ambiente</label>
                        <select
                          value={form.env ?? 'sandbox'}
                          onChange={(e) => update(mp, 'env', e.target.value)}
                          className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
                        >
                          <option value="sandbox">Sandbox</option>
                          <option value="production">Produção</option>
                        </select>
                      </div>
                    </>
                  )}

                  {(mp === 'mercadolivre' || mp === 'nuvemshop' || mp === 'amazon') && (
                    <>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          {mp === 'nuvemshop' ? 'Client ID' : mp === 'amazon' ? 'Client ID (LWA)' : 'App ID (Client ID)'}
                        </label>
                        <Input
                          value={form.appId ?? ''}
                          onChange={(e) => update(mp, 'appId', e.target.value)}
                          placeholder={mp === 'nuvemshop' ? '123456' : mp === 'amazon' ? 'amzn1.application-oa2-client....' : '1234567890123456'}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          {mp === 'amazon' ? 'Client Secret (LWA)' : 'Client Secret'}{cfg?.hasClientSecret && <span className="text-green-600 ml-1 font-normal">✓ salvo</span>}
                        </label>
                        <Input
                          type="password"
                          value={form.clientSecret ?? ''}
                          onChange={(e) => update(mp, 'clientSecret', e.target.value)}
                          placeholder={cfg?.hasClientSecret ? '••••••••' : 'Cole o secret aqui'}
                          className="h-8 text-sm"
                        />
                      </div>
                      {mp === 'amazon' && (
                        <>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Region</label>
                            <select
                              value={form.env ?? 'na'}
                              onChange={(e) => update(mp, 'env', e.target.value)}
                              className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
                            >
                              <option value="na">América do Norte (NA)</option>
                              <option value="eu">Europa (EU)</option>
                              <option value="fe">Extremo Oriente (FE)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Ambiente</label>
                            <select
                              value={form.partnerId ?? 'production'}
                              onChange={(e) => update(mp, 'partnerId', e.target.value)}
                              className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
                            >
                              <option value="sandbox">Sandbox</option>
                              <option value="production">Produção</option>
                            </select>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {cfg?.updatedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      Atualizado em {new Date(cfg.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="w-full"
                    disabled={isSaving}
                    onClick={() => handleSave(mp)}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
