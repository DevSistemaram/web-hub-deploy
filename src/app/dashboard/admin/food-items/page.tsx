'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, RefreshCw, Package, Pencil, Check, X, ChevronDown, FolderPlus, PackagePlus } from 'lucide-react';
import { api, Integration, FoodItem, FoodCategory } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { toastError, toastSuccess } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const UNCATEGORIZED = 'Sem categoria';

// Categorias recém-criadas ainda sem item nunca aparecem em `items` (listItems achata
// catalogs→categories→items) — sem mesclar `allCategories` aqui elas ficam invisíveis
// tanto na accordion quanto no dropdown de "Novo item" (nunca dá pra popular a categoria).
function groupByCategory(items: FoodItem[], allCategories: FoodCategory[]) {
  const groups = new Map<string, { name: string; categoryId: string | null; status: string | null; items: FoodItem[] }>();
  for (const item of items) {
    const key = item.categoryId ?? item.categoryName ?? UNCATEGORIZED;
    const name = item.categoryName ?? UNCATEGORIZED;
    if (!groups.has(key)) groups.set(key, { name, categoryId: item.categoryId, status: item.categoryStatus, items: [] });
    groups.get(key)!.items.push(item);
  }
  for (const category of allCategories) {
    if (!groups.has(category.id)) {
      groups.set(category.id, {
        name: category.name,
        categoryId: category.id,
        status: (category.status as string | undefined) ?? null,
        items: [],
      });
    }
  }
  return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
}

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
  const [allCategories, setAllCategories] = useState<FoodCategory[]>([]);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);

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
    if (!selected) { setItems([]); setAllCategories([]); setCatalogId(null); return; }
    setFetchingItems(true);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      const [list, catalogs] = await Promise.all([
        api.food.listItems(platform, selected.id),
        api.food.getCatalogs(platform, selected.id),
      ]);
      setItems(list);
      const id = catalogs[0]?.catalogId ?? null;
      setCatalogId(id);
      setAllCategories(id ? await api.food.getCategories(platform, selected.id, id) : []);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setFetchingItems(false);
    }
  }, [selected]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const categories = useMemo(() => groupByCategory(items, allCategories), [items, allCategories]);

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

  async function createCategory() {
    if (!selected) return;
    // Campos da categoria confirmados via doc oficial (postman.json, GET categories):
    // id, index, name, template, externalCode, status, items — "template" fica fixo em
    // DEFAULT (PIZZA só é criado automaticamente pela API junto com um item do tipo PIZZA,
    // não é algo que o lojista escolhe manualmente aqui).
    const { value: form } = await Swal.fire({
      title: 'Nova categoria',
      html: `
        <input id="food-category-name" class="swal2-input" style="width:100%;margin:0 0 10px 0" placeholder="Nome da categoria (ex.: Bebidas)">
        <input id="food-category-sku" class="swal2-input" style="width:100%;margin:0 0 10px 0" placeholder="Código externo (opcional)">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin:4px 2px">
          <input id="food-category-available" type="checkbox" checked style="width:16px;height:16px">
          Criar já disponível
        </label>
      `,
      showCancelButton: true,
      confirmButtonText: 'Criar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = (document.getElementById('food-category-name') as HTMLInputElement | null)?.value.trim() ?? '';
        const sku = (document.getElementById('food-category-sku') as HTMLInputElement | null)?.value.trim() ?? '';
        const available = (document.getElementById('food-category-available') as HTMLInputElement | null)?.checked ?? true;
        if (!name) {
          Swal.showValidationMessage('Informe um nome');
          return false;
        }
        return { name, sku, available };
      },
    });
    if (!form) return;
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      const catalogs = await api.food.getCatalogs(platform, selected.id);
      const catalogId = catalogs[0]?.catalogId;
      if (!catalogId) { toastError('Nenhum catálogo encontrado para esta loja'); return; }
      await api.food.createCategory(platform, selected.id, catalogId, {
        name: form.name,
        status: form.available ? 'AVAILABLE' : 'UNAVAILABLE',
        template: 'DEFAULT',
        ...(form.sku ? { externalCode: form.sku } : {}),
      });
      toastSuccess('Categoria criada');
      await loadItems();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao criar categoria');
    }
  }

  async function createItem() {
    if (!selected) return;
    const categoryOptions = categories
      .filter((c) => c.categoryId)
      .map((c) => `<option value="${c.categoryId}">${c.name}</option>`)
      .join('');
    if (!categoryOptions) {
      toastError('Crie uma categoria antes de adicionar um item');
      return;
    }
    const { value: form } = await Swal.fire({
      title: 'Novo item',
      html: `
        <select id="food-item-category" class="swal2-input" style="width:100%;margin:0 0 10px 0">${categoryOptions}</select>
        <input id="food-item-name" class="swal2-input" style="width:100%;margin:0 0 10px 0" placeholder="Nome do item">
        <input id="food-item-sku" class="swal2-input" style="width:100%;margin:0 0 10px 0" placeholder="SKU (código externo, opcional)">
        <input id="food-item-price" class="swal2-input" style="width:100%;margin:0" placeholder="Preço (ex.: 5,00)" inputmode="numeric">
      `,
      showCancelButton: true,
      confirmButtonText: 'Criar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const priceInput = document.getElementById('food-item-price') as HTMLInputElement | null;
        priceInput?.addEventListener('input', () => {
          const digits = priceInput.value.replace(/\D/g, '') || '0';
          priceInput.value = (Number(digits) / 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        });
      },
      preConfirm: () => {
        const categoryId = (document.getElementById('food-item-category') as HTMLSelectElement | null)?.value ?? '';
        const name = (document.getElementById('food-item-name') as HTMLInputElement | null)?.value.trim() ?? '';
        const sku = (document.getElementById('food-item-sku') as HTMLInputElement | null)?.value.trim() ?? '';
        const priceRaw = (document.getElementById('food-item-price') as HTMLInputElement | null)?.value ?? '';
        const price = Number(priceRaw.replace(/\./g, '').replace(',', '.'));
        if (!name || !Number.isFinite(price) || price < 0) {
          Swal.showValidationMessage('Preencha o nome e um preço válido');
          return false;
        }
        return { categoryId, name, sku, price };
      },
    });
    if (!form) return;
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      // UaiRango exige item.type ("DEFAULT"/"PIZZA", nunca "ITEM") e item.productId
      // apontando pra um product com o mesmo id no array `products` (doc oficial,
      // Postman: PUT /catalog/v2.0/merchants/{merchantId}/items) — os ids são
      // gerados no cliente, a API não os cria sozinha.
      const productId = crypto.randomUUID();
      await api.food.upsertItem(platform, selected.id, {
        item: {
          id: crypto.randomUUID(),
          categoryId: form.categoryId,
          productId,
          type: 'DEFAULT',
          status: 'AVAILABLE',
          price: { value: form.price },
          ...(form.sku ? { externalCode: form.sku } : {}),
        },
        products: [
          {
            id: productId,
            name: form.name,
            status: 'AVAILABLE',
            ...(form.sku ? { externalCode: form.sku } : {}),
          },
        ],
      });
      toastSuccess('Item criado');
      await loadItems();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao criar item');
    }
  }

  async function toggleCategory(categoryId: string) {
    if (!selected || !catalogId) return;
    const category = categories.find((c) => c.categoryId === categoryId);
    if (!category) return;
    const nextStatus = isAvailable(category.status ?? '') ? 'UNAVAILABLE' : 'AVAILABLE';
    setSavingCategoryId(categoryId);
    try {
      const platform = selected.marketplace as 'ifood' | 'uairango';
      await api.food.updateCategoryStatus(platform, selected.id, catalogId, categoryId, nextStatus);
      toastSuccess(nextStatus === 'AVAILABLE' ? 'Categoria disponível' : 'Categoria indisponível');
      await loadItems();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao atualizar categoria');
    } finally {
      setSavingCategoryId(null);
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
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={createCategory} disabled={!selected}>
            <FolderPlus className="w-3.5 h-3.5 mr-1.5" /> Nova categoria
          </Button>
          <Button variant="outline" size="sm" onClick={createItem} disabled={!selected}>
            <PackagePlus className="w-3.5 h-3.5 mr-1.5" /> Novo item
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={loadItems}
            disabled={fetchingItems || !selected}
            title="Recarregar itens"
          >
            <RefreshCw className={fetchingItems ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
          </Button>
        </div>
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
          ) : categories.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum item no catálogo desta integração.
              </CardContent>
            </Card>
          ) : (
            <Accordion type="multiple" className="w-full space-y-2" defaultValue={categories.map((c) => c.key)}>
              {categories.map((category) => (
                <AccordionItem key={category.key} value={category.key} className="border rounded-md px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" />
                          <span className="truncate">{category.name} ({category.items.length})</span>
                        </span>
                      </AccordionTrigger>
                    </div>
                    {category.categoryId && (
                      <Button
                        size="sm"
                        variant={isAvailable(category.status ?? '') ? 'outline' : 'default'}
                        disabled={savingCategoryId === category.categoryId}
                        onClick={() => toggleCategory(category.categoryId!)}
                        className="shrink-0"
                      >
                        {isAvailable(category.status ?? '') ? 'Desativar categoria' : 'Ativar categoria'}
                      </Button>
                    )}
                  </div>
                  <AccordionContent className="pb-2">
                    <div className="space-y-2">
                      {category.items.map((item) => {
                        const editing = editingId === item.itemId;
                        const saving = savingId === item.itemId;
                        const available = isAvailable(item.status);
                        return (
                          <Card key={item.itemId}>
                            <CardContent className="py-3 flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-foreground truncate">
                                    {item.name}{item.priceName ? ` - [${item.priceName}]` : ''}
                                  </span>
                                  <Badge variant={available ? 'success' : 'destructive'} className="text-[10px]">
                                    {available ? 'Disponível' : 'Indisponível'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">SKU {item.sku}</p>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </>
      )}
    </div>
  );
}
