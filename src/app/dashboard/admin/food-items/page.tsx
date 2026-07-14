'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Package, Pencil, Check, X } from 'lucide-react';
import { api, Integration, FoodItem } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { toastError, toastSuccess } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function money(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);
}

function isAvailable(status: string) {
  return status.toUpperCase() !== 'UNAVAILABLE';
}

export default function FoodItemsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const loadItems = useCallback(async () => {
    if (!selected) { setItems([]); return; }
    setFetchingItems(true);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      const list = await api.food.listItems(platform, selected.id);
      setItems(list);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setFetchingItems(false);
    }
  }, [selected]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function startEdit(item: FoodItem) {
    setEditingId(item.itemId);
    setPriceDraft(String(item.price));
  }

  async function savePrice(item: FoodItem) {
    const price = Number(priceDraft.replace(',', '.'));
    if (!selected || !Number.isFinite(price) || price < 0) {
      toastError('Preço inválido');
      return;
    }
    setSavingId(item.itemId);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      await api.food.updateItemPrice(platform, selected.id, item.itemId, price);
      toastSuccess('Preço atualizado');
      setEditingId(null);
      await loadItems();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao atualizar preço');
    } finally {
      setSavingId(null);
    }
  }

  async function toggleStock(item: FoodItem) {
    if (!selected) return;
    const nextStatus = isAvailable(item.status) ? 'UNAVAILABLE' : 'AVAILABLE';
    setSavingId(item.itemId);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      await api.food.updateItemStatus(platform, selected.id, item.itemId, nextStatus);
      toastSuccess(nextStatus === 'AVAILABLE' ? 'Item disponível' : 'Item indisponível');
      await loadItems();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao atualizar estoque');
    } finally {
      setSavingId(null);
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
            <Package className="w-5 h-5" /> Itens Food
          </h1>
          <p className="text-muted-foreground text-sm">
            Selecione uma integração, liste os itens do catálogo e altere preço/estoque.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={loadItems}
          disabled={fetchingItems || !selected}
          title="Recarregar itens"
        >
          <RefreshCw className={fetchingItems ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
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
              onChange={(e) => { setSelectedId(e.target.value); setEditingId(null); }}
              className="w-full h-9 text-sm rounded-md border border-input bg-background px-2"
            >
              {integrations.map((i) => (
                <option key={i.id} value={i.id}>
                  {(i.nickname ?? i.marketplace)} — {i.marketplace} ({i.id.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {fetchingItems ? (
            <div className="text-muted-foreground text-sm">Carregando itens...</div>
          ) : items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum item no catálogo desta integração.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const editing = editingId === item.itemId;
                const saving = savingId === item.itemId;
                const available = isAvailable(item.status);
                return (
                  <Card key={item.itemId}>
                    <CardContent className="py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                          <Badge variant={available ? 'success' : 'destructive'} className="text-[10px]">
                            {available ? 'Disponível' : 'Indisponível'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          SKU {item.sku}{item.categoryName ? ` · ${item.categoryName}` : ''}
                        </p>
                      </div>

                      {editing ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Input
                            value={priceDraft}
                            onChange={(e) => setPriceDraft(e.target.value)}
                            className="w-24 h-8 text-sm"
                            autoFocus
                          />
                          <Button size="icon" className="h-8 w-8" disabled={saving} onClick={() => savePrice(item)}>
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={saving}
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="flex items-center gap-1 text-sm font-semibold text-foreground shrink-0 hover:text-primary transition-colors"
                          title="Editar preço"
                        >
                          {money(item.price)}
                          <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}

                      <Button
                        size="sm"
                        variant={available ? 'outline' : 'default'}
                        disabled={saving || editing}
                        onClick={() => toggleStock(item)}
                        className="shrink-0"
                      >
                        {available ? 'Marcar indisponível' : 'Marcar disponível'}
                      </Button>
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
