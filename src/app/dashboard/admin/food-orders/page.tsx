'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, Clock, RefreshCw, UtensilsCrossed } from 'lucide-react';
import {
  api,
  Integration,
  FoodOrder,
  FoodOrderStatus,
  FoodOrderAction,
  FoodOrderActionParams,
  FoodCancellationReason,
} from '@/lib/api';
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

// Espelha food-status.ts: UaiRango diverge por orderType em ambas as direções —
// retirada não tem ação "dispatch" (Merchant API não expõe isso pra pickup; READY é terminal
// pras ações manuais, CONCLUDED só via evento) e entrega não tem "readyToPickup" (UaiRango
// DELIVERY não passa por READY — vai direto de Em preparo pra Saiu pra entrega).
const PICKUP_ORDER_TYPES = new Set(['TAKEOUT', 'RETIRAR']);
function isPickup(orderType?: string): boolean {
  return !!orderType && PICKUP_ORDER_TYPES.has(orderType.toUpperCase());
}

function actionsFor(order: FoodOrder): FoodOrderAction[] {
  const base = FOOD_TRANSITIONS[order.status] ?? [];
  if (order.platform !== 'uairango') return base;
  return isPickup(order.orderType)
    ? base.filter((a) => a !== 'dispatch')
    : base.filter((a) => a !== 'readyToPickup');
}

// Sem ação manual mas o pedido ainda não fechou de verdade — CONCLUDED só chega via
// evento/poll da plataforma (DISPATCHED na entrega, READY na retirada UaiRango).
function isWaitingOnPlatform(order: FoodOrder): boolean {
  if (order.status === 'DISPATCHED') return true;
  if (order.status === 'READY' && order.platform === 'uairango' && isPickup(order.orderType)) return true;
  return false;
}

function statusVariant(status: FoodOrderStatus): 'success' | 'warning' | 'destructive' | 'outline' {
  if (status === 'CONCLUDED') return 'success';
  if (status === 'CANCELLED') return 'destructive';
  if (status === 'DISPATCHED' || status === 'READY') return 'warning';
  return 'outline';
}

function money(v: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(v ?? 0);
}

// Consulta obrigatória (homologação): busca na plataforma os motivos/códigos válidos
// pra ESSE pedido antes de abrir o diálogo de cancelamento — nunca uma lista fixa local.
async function requestCancellationParams(order: FoodOrder): Promise<FoodOrderActionParams | null> {
  let reasons: FoodCancellationReason[] = [];
  try {
    reasons = await api.food.getCancellationReasons(order.id);
  } catch (err) {
    toastError(err instanceof Error ? err.message : 'Erro ao consultar motivos de cancelamento');
    return null;
  }

  if (!reasons.length) {
    toastError('Nenhum motivo de cancelamento disponível pra este pedido');
    return null;
  }

  const options = reasons
    .map((reason) => `<option value="${reason.cancelCodeId}">${reason.cancelCodeId} - ${reason.description}</option>`)
    .join('');

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
      const selected = reasons.find((reason) => String(reason.cancelCodeId) === cancellationCode);
      const reason = reasonInput?.value.trim() || selected?.description || 'Cancelado pelo lojista';
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
                const actions = actionsFor(order);
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
                        <p>
                          Pagamento: {order.paymentType ?? order.paymentMethod ?? '—'}
                          {order.cardBrand ? ` (${order.cardBrand})` : ''}
                          {order.changeFor != null ? ` · Troco para ${money(order.changeFor, order.financial?.currency)}` : ''}
                        </p>
                        {order.discounts?.length > 0 && (
                          <p>
                            Cupom: {money(
                              order.discounts.reduce((sum, d) => sum + d.value, 0),
                              order.financial?.currency,
                            )}{' '}
                            ({order.discounts.map((d) => `${d.description}: banca ${d.target}`).join('; ')})
                          </p>
                        )}
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
                          isWaitingOnPlatform(order) ? (
                            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                              <Clock className="w-3.5 h-3.5" />
                              Aguardando confirmação da plataforma pra concluir (sem ação manual).
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem ações disponíveis (estado final).</span>
                          )
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
