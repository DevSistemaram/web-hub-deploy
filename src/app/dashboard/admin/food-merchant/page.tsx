'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Store, Power, Copy, Check, AlertTriangle } from 'lucide-react';
import { api, Integration, FoodMerchantDetails, FoodMerchantStatus } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { toastError, toastSuccess } from '@/lib/swal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const PLATFORM_STYLES: Record<string, { ring: string; bg: string; text: string; label: string }> = {
  ifood: { ring: 'ring-red-200', bg: 'bg-red-50', text: 'text-red-600', label: 'iFood' },
  uairango: { ring: 'ring-orange-200', bg: 'bg-orange-50', text: 'text-orange-600', label: 'UaiRango' },
};

function platformStyle(marketplace: string) {
  return PLATFORM_STYLES[marketplace] ?? { ring: 'ring-border', bg: 'bg-muted', text: 'text-muted-foreground', label: marketplace };
}

export default function FoodMerchantPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [details, setDetails] = useState<FoodMerchantDetails | null>(null);
  const [status, setStatus] = useState<FoodMerchantStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    (async () => {
      try {
        const all = await api.integrations.list();
        const food = all.filter((i) => (i.marketplace === 'ifood' || i.marketplace === 'uairango') && i.isActive);
        setIntegrations(food);
        if (food.length) setSelectedId(food[0].id);
      } catch {
        toastError('Erro ao carregar integrações');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const selected = integrations.find((i) => i.id === selectedId);
  const style = selected ? platformStyle(selected.marketplace) : platformStyle('');

  const load = useCallback(async () => {
    if (!selected) { setDetails(null); setStatus(null); return; }
    setFetching(true);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      const [d, s] = await Promise.all([
        api.food.getMerchantDetails(platform, selected.id),
        api.food.getMerchantStatus(platform, selected.id),
      ]);
      setDetails(d);
      setStatus(s);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao carregar loja');
    } finally {
      setFetching(false);
    }
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus() {
    if (!selected || !status) return;
    const nextAvailable = !status.available;
    setSaving(true);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      await api.food.updateMerchantStatus(platform, selected.id, { available: nextAvailable });
      toastSuccess(nextAvailable ? 'Loja aberta' : 'Loja fechada');
      await load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao atualizar status da loja');
    } finally {
      setSaving(false);
    }
  }

  async function copyMerchantId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toastError('Não foi possível copiar');
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3.5 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Store className="w-5 h-5" /> Loja Food
          </h1>
          <p className="text-muted-foreground text-sm">
            Detalhes da loja na plataforma e abertura/fechamento.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={load}
          disabled={fetching || !selected}
          title="Recarregar"
        >
          <RefreshCw className={cn('w-4 h-4', fetching && 'animate-spin')} />
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
            <Store className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma integração food ativa. Conecte iFood ou UaiRango em Integrações.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <Label htmlFor="food-merchant-integration" className="text-xs text-muted-foreground mb-1.5 block">
              Integração
            </Label>
            <div className="relative">
              <span
                className={cn(
                  'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full',
                  selected?.marketplace === 'ifood' ? 'bg-red-500' : 'bg-orange-500',
                )}
              />
              <select
                id="food-merchant-integration"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full h-9 text-sm rounded-md border border-input bg-background pl-6 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {integrations.map((i) => (
                  <option key={i.id} value={i.id}>
                    {(i.nickname ?? i.marketplace)} — {platformStyle(i.marketplace).label} ({i.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fetching ? (
            <Card>
              <CardContent className="py-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                    <div className="space-y-2 pt-0.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-28 rounded-md" />
              </CardContent>
            </Card>
          ) : !details || !status ? (
            <Card className="border-dashed">
              <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Não foi possível carregar os dados da loja.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className={cn('h-1 w-full', status.available ? 'bg-success' : 'bg-destructive')} />
              <CardContent className="py-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-4',
                        style.bg,
                        style.ring,
                      )}
                    >
                      <Store className={cn('h-5 w-5', style.text)} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{details.name}</p>
                      {details.corporateName && (
                        <p className="text-xs text-muted-foreground truncate">{details.corporateName}</p>
                      )}
                      <button
                        onClick={() => copyMerchantId(details.id)}
                        className="mt-1 inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                        title="Copiar Merchant ID"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {details.id}
                      </button>
                    </div>
                  </div>
                  <Badge variant={status.available ? 'success' : 'destructive'} className="shrink-0 gap-1.5">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        status.available ? 'bg-success' : 'bg-destructive',
                      )}
                    />
                    {status.available ? 'Aberta' : 'Fechada'}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {status.available
                      ? 'A loja está recebendo pedidos normalmente.'
                      : 'A loja está fechada — não aparece disponível no app.'}
                  </p>
                  <Button
                    size="sm"
                    variant={status.available ? 'outline' : 'default'}
                    disabled={saving}
                    onClick={toggleStatus}
                    className="shrink-0"
                  >
                    <Power className={cn('w-3.5 h-3.5', saving && 'animate-pulse')} />
                    {status.available ? 'Fechar loja' : 'Abrir loja'}
                  </Button>
                </div>

                <details className="text-xs group">
                  <summary className="cursor-pointer text-muted-foreground select-none hover:text-foreground transition-colors">
                    Ver payload completo
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg border border-border bg-muted overflow-x-auto text-[11px] leading-relaxed">
                    {JSON.stringify({ details, status }, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
