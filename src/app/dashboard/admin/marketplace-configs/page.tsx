'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ShoppingBag, ArrowLeft, CheckCircle2, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { api, MarketplaceConfig, UpsertMarketplaceConfigPayload } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { toastError } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        initial[c.marketplace] = {
          redirectUri: c.redirectUri ?? '',
          ...(c.marketplace === 'shopee' ? {
            partnerId: c.partnerId ?? '',
            env: c.env ?? 'sandbox',
            partnerKeyExpiresAt: c.partnerKeyExpiresAt ?? '',
          } : {}),
          ...(c.marketplace === 'mercadolivre' ? { appId: c.appId ?? '' } : {}),
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

  async function handleSave(marketplace: 'shopee' | 'mercadolivre') {
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
            Credenciais de acesso às APIs da Shopee e Mercado Livre. Chaves secretas nunca são exibidas após salvar.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={load} title="Recarregar">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['shopee', 'mercadolivre'] as const).map((mp) => {
          const cfg = configs.find((c) => c.marketplace === mp);
          const form = forms[mp] ?? {};
          const isSaving = saving === mp;
          const label = mp === 'shopee' ? 'Shopee' : 'Mercado Livre';
          const Icon = mp === 'shopee' ? ShoppingBag : ShoppingCart;

          return (
            <Card key={mp}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="w-4 h-4" />
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
                  <Input
                    value={form.redirectUri ?? ''}
                    onChange={(e) => update(mp, 'redirectUri', e.target.value)}
                    placeholder="https://app.exemplo.com/callback"
                    className="h-8 text-sm"
                  />
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
                          const Icon = st.icon;
                          return (
                            <Badge variant={st.variant} className="ml-2 text-[10px] inline-flex items-center gap-0.5 py-0">
                              <Icon className="w-3 h-3" />{st.label}
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

                {mp === 'mercadolivre' && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">App ID (Client ID)</label>
                      <Input
                        value={form.appId ?? ''}
                        onChange={(e) => update(mp, 'appId', e.target.value)}
                        placeholder="1234567890123456"
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
                        onChange={(e) => update(mp, 'clientSecret', e.target.value)}
                        placeholder={cfg?.hasClientSecret ? '••••••••' : 'Cole o secret aqui'}
                        className="h-8 text-sm"
                      />
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
                  onClick={() => handleSave(mp)}
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
