'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { api, Integration, FoodOrder, FoodOrderStatus, FoodOrderAction, FoodOrderActionParams } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { toastError, toastSuccess } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Constantes espelhadas de hub-api/src/food/food-status.ts (fonte de verdade é o backend).
const FOOD_STATUS_LABEL: Record<FoodOrderStatus, string> = {
  PLACED: 'Novo',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Em preparo',
  READY: 'Pronto',
  DISPATCHED: 'Despachado',
  CONCLUDED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const FOOD_ACTION_LABEL: Record<FoodOrderAction, string> = {
  confirm: 'Confirmar',
  readyToPickup: 'Marcar pronto',
  dispatch: 'Despachar',
  requestCancellation: 'Cancelar',
};

// Ações válidas por status — só decide quais botões mostrar; backend revalida via canTransition.
// iFood: confirmar já é preparo (confirm leva de Novo → Em preparo).
const FOOD_TRANSITIONS: Record<FoodOrderStatus, FoodOrderAction[]> = {
  PLACED: ['confirm', 'requestCancellation'],
  CONFIRMED: ['readyToPickup', 'dispatch', 'requestCancellation'],
  PREPARING: ['readyToPickup', 'dispatch', 'requestCancellation'],
  READY: ['dispatch', 'requestCancellation'],
  DISPATCHED: [],
  CONCLUDED: [],
  CANCELLED: [],
};

const FOOD_CANCELLATION_REASONS = [
  { code: '501', label: 'Item indisponível' },
  { code: '502', label: 'Restaurante fechado' },
  { code: '503', label: 'Cardápio desatualizado' },
  { code: '504', label: 'Pedido fora da área de entrega' },
  { code: '505', label: 'Cliente solicitou o cancelamento' },
  { code: '506', label: 'Problemas operacionais' },
  { code: '507', label: 'Problemas sistêmicos' },
  { code: '508', label: 'Outro motivo' },
] as const;

function statusVariant(status: FoodOrderStatus): 'success' | 'warning' | 'destructive' | 'outline' {
  if (status === 'CONCLUDED') return 'success';
  if (status === 'CANCELLED') return 'destructive';
  if (status === 'DISPATCHED' || status === 'READY') return 'warning';
  return 'outline';
}

function money(v: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(v ?? 0);
}

async function requestCancellationParams(order: FoodOrder): Promise<FoodOrderActionParams | null> {
  const options = FOOD_CANCELLATION_REASONS.map(
    (reason) => `<option value="${reason.code}">${reason.code} - ${reason.label}</option>`,
  ).join('');

  const result = await Swal.fire<FoodOrderActionParams>({
    title: `Cancelar pedido #${order.displayId || order.platformOrderId}`,
    html: `
      <div style="text-align:left">
        <label for="food-cancellation-code" style="display:block;margin-bottom:6px;font-size:13px;font-weight:600">
          Motivo
        </label>
        <select id="food-cancellation-code" class="swal2-input" style="width:100%;margin:0 0 14px 0">
          <option value="">Selecione um motivo</option>
          ${options}
        </select>
        <label for="food-cancellation-reason" style="display:block;margin-bottom:6px;font-size:13px;font-weight:600">
          Observação
        </label>
        <textarea id="food-cancellation-reason" class="swal2-textarea" maxlength="255" style="width:100%;margin:0;min-height:96px"></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Cancelar pedido',
    cancelButtonText: 'Voltar',
    confirmButtonColor: '#ef4444',
    reverseButtons: true,
    focusConfirm: false,
    preConfirm: () => {
      const codeInput = document.getElementById('food-cancellation-code') as HTMLSelectElement | null;
      const reasonInput = document.getElementById('food-cancellation-reason') as HTMLTextAreaElement | null;
      const cancellationCode = codeInput?.value.trim() ?? '';
      if (!cancellationCode) {
        Swal.showValidationMessage('Selecione o motivo do cancelamento');
        return false;
      }
      const selected = FOOD_CANCELLATION_REASONS.find((reason) => reason.code === cancellationCode);
      const reason = reasonInput?.value.trim() || selected?.label || 'Cancelado pelo lojista';
      return { cancellationCode, reason };
    },
  });

  return result.isConfirmed ? result.value ?? null : null;
}

export default function FoodOrdersTestPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

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

  const loadOrders = useCallback(async () => {
    if (!selected) { setOrders([]); return; }
    setFetchingOrders(true);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      const all = await api.food.listOrders({ platform });
      setOrders(all.filter((o) => o.integrationId === selected.id));
    } catch {
      toastError('Erro ao carregar pedidos');
    } finally {
      setFetchingOrders(false);
    }
  }, [selected]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function handleAction(order: FoodOrder, action: FoodOrderAction) {
    let params: FoodOrderActionParams | undefined;
    if (action === 'requestCancellation') {
      const cancellationParams = await requestCancellationParams(order);
      if (!cancellationParams) return;
      params = cancellationParams;
    }
    setActingId(order.id);
    try {
      const res = await api.food.updateOrderStatus(order.id, action, params);
      toastSuccess(`Status atualizado: ${FOOD_STATUS_LABEL[res.status] ?? res.status}`);
      await loadOrders();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setActingId(null);
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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" /> Pedidos Food (teste)
          </h1>
          <p className="text-muted-foreground text-sm">
            Selecione uma integração, liste os pedidos e altere o status manualmente.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={loadOrders}
          disabled={fetchingOrders || !selected}
          title="Recarregar pedidos"
        >
          <RefreshCw className={fetchingOrders ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhuma integração food ativa. Conecte iFood ou UaiRango em Integrações.
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Integração</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full h-9 text-sm rounded-md border border-input bg-background px-2"
            >
              {integrations.map((i) => (
                <option key={i.id} value={i.id}>
                  {(i.nickname ?? i.marketplace)} — {i.marketplace} ({i.id.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {fetchingOrders ? (
            <div className="text-muted-foreground text-sm">Carregando pedidos...</div>
          ) : orders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum pedido para esta integração.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const actions = FOOD_TRANSITIONS[order.status] ?? [];
                const isActing = actingId === order.id;
                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span>#{order.displayId || order.platformOrderId}</span>
                        <Badge variant={statusVariant(order.status)} className="text-[10px]">
                          {FOOD_STATUS_LABEL[order.status] ?? order.status}
                        </Badge>
                        {order.requiresDeliveryCode && (
                          <Badge variant="warning" className="text-[10px]">Código na entrega</Badge>
                        )}
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : ''}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Cliente: {order.customer?.name ?? '—'}{order.customer?.phone ? ` · ${order.customer.phone}` : ''}</p>
                        <p>
                          {order.items?.length ?? 0} item(s) · Total {money(order.financial?.total ?? 0, order.financial?.currency)}
                        </p>
                      </div>

                      {order.items?.length > 0 && (
                        <ul className="text-xs text-foreground list-disc pl-4 space-y-0.5">
                          {order.items.map((it, idx) => (
                            <li key={idx}>{it.quantity}× {it.title}</li>
                          ))}
                        </ul>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        {actions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Sem ações disponíveis (estado final).</span>
                        ) : (
                          actions.map((action) => (
                            <Button
                              key={action}
                              size="sm"
                              variant={action === 'requestCancellation' ? 'outline' : 'default'}
                              disabled={isActing}
                              onClick={() => handleAction(order, action)}
                            >
                              {FOOD_ACTION_LABEL[action]}
                            </Button>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
