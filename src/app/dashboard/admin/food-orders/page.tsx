'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  CreditCard,
  Wallet,
  StickyNote,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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
  // Cancelamento continua disponível após o despacho (exigência de homologação UaiRango:
  // "Cancelar" precisa aparecer em praticamente todo status) — só CONCLUDED/CANCELLED
  // (estados terminais de verdade) ficam sem ação.
  DISPATCHED: ['requestCancellation'],
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

function orderTypeMeta(orderType: string) {
  const t = (orderType ?? '').toUpperCase();
  if (isPickup(t)) return { icon: ShoppingBag, label: 'Retirada' };
  if (t === 'DELIVERY' || t === 'ENTREGA') return { icon: Bike, label: 'Entrega' };
  return { icon: UtensilsCrossed, label: orderType || 'Pedido' };
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

const STATUS_STRIPE: Record<ReturnType<typeof statusVariant>, string> = {
  success: 'bg-success',
  destructive: 'bg-destructive',
  warning: 'bg-amber-400',
  outline: 'bg-border',
};

function money(v: number, currency = 'BRL') { 
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(v ?? 0);
}

// Consulta obrigatória (homologação): busca na plataforma os motivos/códigos válidos
// pra ESSE pedido antes de abrir o diálogo de cancelamento — nunca uma lista fixa local.
// Testado em produção: o código genérico "1" (Problemas de sistema, padrão documentado)
// foi rejeitado pela UaiRango com "Código de cancelamento inválido" — não existe fallback
// que sirva às cegas pra essa conta, então quando a consulta vem vazia o cancelamento
// fica bloqueado de propósito (evita mandar mais códigos chutados pra produção).
async function requestCancellationParams(order: FoodOrder): Promise<FoodOrderActionParams | null> {
  let reasons: FoodCancellationReason[] = [];
  try {
    reasons = await api.food.getCancellationReasons(order.id);
  } catch (err) {
    toastError(err instanceof Error ? err.message : 'Erro ao consultar motivos de cancelamento');
    return null;
  }

  if (!reasons.length) {
    toastError(
      'A plataforma não retornou motivos de cancelamento válidos pra este pedido — ' +
        'contate o suporte da UaiRango pra descobrir os códigos corretos dessa conta.',
    );
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

function OrderCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </CardContent>
    </Card>
  );
}

export default function FoodOrdersTestPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

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

  // Pedidos parados (sem evento novo) não são re-normalizados pelo poller — esse refresh
  // manual busca o pedido direto na plataforma pra atualizar campos que só o payload
  // congelado não tem ainda (ex.: observações adicionadas depois no normalizeOrder).
  async function refreshOrder(order: FoodOrder) {
    setRefreshingId(order.id);
    try {
      await api.food.refreshOrder(order.id);
      toastSuccess('Pedido re-sincronizado');
      await loadOrders();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao re-sincronizar pedido');
    } finally {
      setRefreshingId(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-3.5 w-72" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    );
  }

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
          <RefreshCw className={cn('w-4 h-4', fetchingOrders && 'animate-spin')} />
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma integração food ativa. Conecte iFood ou UaiRango em Integrações.
            </p>
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
            <div className="space-y-3">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </div>
          ) : orders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
                <UtensilsCrossed className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Nenhum pedido para esta integração.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const actions = actionsFor(order);
                const isActing = actingId === order.id;
                const variant = statusVariant(order.status);
                const type = orderTypeMeta(order.orderType);
                const currency = order.financial?.currency;
                const hasDiscount = (order.discounts?.length ?? 0) > 0;
                const discountTotal = order.discounts?.reduce((sum, d) => sum + d.value, 0) ?? 0;

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <div className={cn('h-1 w-full', STATUS_STRIPE[variant])} />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                        <span>#{order.displayId || order.platformOrderId}</span>
                        <Badge variant={variant} className="text-[10px]">
                          {FOOD_STATUS_LABEL[order.status] ?? order.status}
                        </Badge>
                        <Badge variant="muted" className="text-[10px] gap-1">
                          <type.icon className="w-3 h-3" />
                          {type.label}
                        </Badge>
                        {order.requiresDeliveryCode && (
                          <Badge variant="warning" className="text-[10px]">Código na entrega</Badge>
                        )}
                        <Badge variant={order.prepaid ? 'success' : 'outline'} className="text-[10px]">
                          {order.prepaid ? 'Pago online' : 'Pagar na entrega'}
                        </Badge>
                        <span className="ml-auto text-xs font-normal text-muted-foreground shrink-0">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : ''}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          disabled={refreshingId === order.id}
                          onClick={() => refreshOrder(order)}
                          title="Re-sincronizar pedido com a plataforma"
                        >
                          <RefreshCw className={cn('w-3.5 h-3.5', refreshingId === order.id && 'animate-spin')} />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                        <p className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          {order.customer?.name ?? '—'}
                        </p>
                        {order.customer?.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {order.customer.phone}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5">
                          {order.prepaid ? <CreditCard className="w-3.5 h-3.5 shrink-0" /> : <Wallet className="w-3.5 h-3.5 shrink-0" />}
                          {order.paymentType ?? order.paymentMethod ?? '—'}
                          {order.cardBrand ? ` (${order.cardBrand})` : ''}
                          {order.changeFor != null ? ` · Troco para ${money(order.changeFor, currency)}` : ''}
                        </p>
                        {order.address && (
                          <p className="flex items-start gap-1.5 sm:col-span-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              {order.address.street}
                              {order.address.neighborhood ? `, ${order.address.neighborhood}` : ''}
                              {' — '}
                              {order.address.city}/{order.address.state}
                              {order.address.zipCode ? ` · ${order.address.zipCode}` : ''}
                            </span>
                          </p>
                        )}
                      </div>

                      {order.items?.length > 0 && (
                        <div className="rounded-md border border-border divide-y divide-border">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-3 px-2.5 py-1.5 text-xs">
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">
                                  {it.quantity}× {it.title}
                                </p>
                                {it.observations && (
                                  <p className="flex items-start gap-1 text-muted-foreground italic mt-0.5">
                                    <StickyNote className="w-3 h-3 shrink-0 mt-0.5" />
                                    {it.observations}
                                  </p>
                                )}
                              </div>
                              <span className="text-muted-foreground shrink-0">{money(it.totalPrice, currency)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {order.observations && (
                        <p className="flex items-start gap-1.5 text-xs rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{order.observations}</span>
                        </p>
                      )}

                      <Separator />

                      <div className="text-xs space-y-1 max-w-[220px] ml-auto">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{money(order.financial?.subtotal ?? 0, currency)}</span>
                        </div>
                        {(order.financial?.deliveryFee ?? 0) > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Entrega</span>
                            <span>{money(order.financial.deliveryFee, currency)}</span>
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="flex justify-between text-success">
                            <span>
                              Cupom ({order.discounts.map((d) => `${d.description}: banca ${d.target}`).join('; ')})
                            </span>
                            <span>-{money(discountTotal, currency)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border">
                          <span>Total</span>
                          <span>{money(order.financial?.total ?? 0, currency)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {isWaitingOnPlatform(order) && (
                          <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                            <Clock className="w-3.5 h-3.5" />
                            Aguardando confirmação da plataforma pra concluir.
                          </span>
                        )}
                        {actions.length === 0 ? (
                          !isWaitingOnPlatform(order) && (
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
