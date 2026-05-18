'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy, Trash2, ShieldCheck, ShieldOff, RefreshCw,
  Plus, ShoppingCart, ShoppingBag, UserCheck, Search, ClipboardList,
  AlertCircle, Users, Mail, History, ChevronDown, Info, X,
} from 'lucide-react';
import Link from 'next/link';
import { api, Invitation, AdminUser, Integration, ShopeeShopInfo, ShopeeBrOnboardingInfo } from '@/lib/api';
import { isAdmin, startImpersonation, getUser } from '@/lib/auth';
import { confirm, toastError } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

type AdminTab = 'users' | 'invites';

const MARKETPLACE_ICON: Record<string, React.ElementType> = {
  mercadolivre: ShoppingCart,
  shopee: ShoppingBag,
};

const MARKETPLACE_LABEL: Record<string, string> = {
  mercadolivre: 'Mercado Livre',
  shopee: 'Shopee',
};

function tokenStatus(expiresAt: string | null): { label: string; variant: 'success' | 'warning' | 'destructive' | 'outline' } {
  if (!expiresAt) return { label: 'Sem data', variant: 'outline' };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return { label: 'Expirado', variant: 'destructive' };
  if (diff < 30 * 60 * 1000) return { label: 'Expira em breve', variant: 'warning' };
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return { label: `Expira em ${hours}h`, variant: 'success' };
  const days = Math.floor(diff / 86400000);
  return { label: `Expira em ${days}d`, variant: 'success' };
}

function TokenBadge({ expiresAt }: { expiresAt: string | null }) {
  const st = tokenStatus(expiresAt);
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={st.variant} className="text-[10px] py-0 px-1.5 w-fit">
        {st.variant === 'destructive' && <AlertCircle className="w-2.5 h-2.5 mr-0.5" />}
        {st.label}
      </Badge>
      {expiresAt && (
        <span className="text-[10px] text-muted-foreground">
          {new Date(expiresAt).toLocaleDateString('pt-BR')} {new Date(expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      {!expiresAt && <span className="text-[10px] text-muted-foreground">—</span>}
    </div>
  );
}

type ShopeeModalTab = 'info' | 'onboarding';

interface ShopeeModalEntry {
  id: string;
  label: string;
  info: ShopeeShopInfo;
  onboarding: ShopeeBrOnboardingInfo | null;
  onboardingError: string | null;
}

function ShopeeJsonModal({ entry, onClose }: { entry: ShopeeModalEntry; onClose: () => void }) {
  const [tab, setTab] = useState<ShopeeModalTab>('info');
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const activeJson = tab === 'info'
    ? JSON.stringify(entry.info, null, 2)
    : entry.onboarding
      ? JSON.stringify(entry.onboarding, null, 2)
      : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleCopy() {
    if (!activeJson) return;
    navigator.clipboard.writeText(activeJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const TABS: { key: ShopeeModalTab; label: string; endpoint: string }[] = [
    { key: 'info', label: 'Loja', endpoint: 'get_shop_info' },
    { key: 'onboarding', label: 'KYC BR', endpoint: 'get_br_shop_onboarding_info' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (!dialogRef.current?.contains(e.target as Node)) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">{entry.label}</span>
            <span className="text-xs text-muted-foreground">— {TABS.find((t) => t.key === tab)?.endpoint}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {activeJson && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-border shrink-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setCopied(false); }}
              className={cn(
                'px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
                tab === t.key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto flex-1 p-4">
          {activeJson ? (
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {activeJson}
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              {entry.onboardingError ?? 'Dados não disponíveis para esta loja.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationTable({ integrations }: { integrations: Integration[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalEntry, setModalEntry] = useState<ShopeeModalEntry | null>(null);
  const [cache, setCache] = useState<Record<string, ShopeeModalEntry>>({});

  async function handleShopeeInfo(id: string, label: string) {
    if (cache[id]) { setModalEntry(cache[id]); return; }
    setLoadingId(id);
    try {
      const [infoResult, onboardingResult] = await Promise.allSettled([
        api.admin.getShopeeInfo(id),
        api.admin.getShopeeOnboarding(id),
      ]);

      if (infoResult.status === 'rejected') {
        throw infoResult.reason instanceof Error ? infoResult.reason : new Error('Erro ao buscar info da loja');
      }

      const entry: ShopeeModalEntry = {
        id,
        label,
        info: infoResult.value,
        onboarding: onboardingResult.status === 'fulfilled' ? onboardingResult.value : null,
        onboardingError: onboardingResult.status === 'rejected'
          ? (onboardingResult.reason instanceof Error ? onboardingResult.reason.message : 'Erro ao buscar KYC BR')
          : null,
      };

      setCache((prev) => ({ ...prev, [id]: entry }));
      setModalEntry(entry);
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao buscar info da loja');
    } finally { setLoadingId(null); }
  }

  return (
    <>
      {modalEntry && (
        <ShopeeJsonModal entry={modalEntry} onClose={() => setModalEntry(null)} />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Loja</th>
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Marketplace</th>
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Access Token</th>
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Refresh Token</th>
              <th className="py-1.5 px-2" />
            </tr>
          </thead>
          <tbody>
            {integrations.map((int) => {
              const Icon = MARKETPLACE_ICON[int.marketplace] ?? ShoppingCart;
              const label = int.nickname || `${int.sellerId ?? int.shopId ?? int.id.slice(0, 8)}`;
              return (
                <tr key={int.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground truncate max-w-[120px]">{label}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span className="text-muted-foreground">{MARKETPLACE_LABEL[int.marketplace] ?? int.marketplace}</span>
                  </td>
                  <td className="py-2 px-2"><TokenBadge expiresAt={int.tokenExpiresAt} /></td>
                  <td className="py-2 px-2"><TokenBadge expiresAt={int.refreshTokenExpiresAt} /></td>
                  <td className="py-2 px-2">
                    {int.marketplace === 'shopee' && (
                      <button
                        onClick={() => handleShopeeInfo(int.id, label)}
                        disabled={loadingId === int.id}
                        title="Ver informações da loja Shopee"
                        className={cn(
                          'flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium transition-colors',
                          'border-border text-muted-foreground hover:text-foreground hover:bg-accent',
                          loadingId === int.id && 'opacity-50 pointer-events-none',
                        )}
                      >
                        <Info className="w-3 h-3" />
                        {loadingId === int.id ? '...' : 'Info'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 select-none border border-primary/20">
      {initials}
    </div>
  );
}

function IconButton({
  onClick, title, icon: Icon, variant = 'default', disabled,
}: {
  onClick: () => void;
  title: string;
  icon: React.ElementType;
  variant?: 'default' | 'destructive' | 'promote';
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center transition-colors shrink-0 border',
        variant === 'default' && 'text-muted-foreground border-border hover:bg-accent hover:text-foreground',
        variant === 'destructive' && 'text-destructive border-destructive/20 hover:bg-destructive/10',
        variant === 'promote' && 'text-primary border-primary/20 hover:bg-primary/10',
        disabled && 'opacity-40 pointer-events-none',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function TabButton({
  active, onClick, label, count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
      )}
    >
      {label}
      {count !== undefined && (
        <Badge
          variant={active ? 'default' : 'secondary'}
          className="text-[10px] px-1.5 py-0 h-4 min-w-4"
        >
          {count}
        </Badge>
      )}
    </button>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-64" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('users');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const currentUserId = getUser()?.id;

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    loadAll();
  }, [router]);

  async function loadAll() {
    setLoading(true);
    try {
      const [inv, usr] = await Promise.all([
        api.admin.listInvitations(),
        api.admin.listUsers(),
      ]);
      setInvitations(inv);
      setUsers(usr);
    } catch { /* silence */ }
    finally { setLoading(false); }
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.admin.createInvitation({ email: inviteEmail || undefined });
      setInviteEmail('');
      await loadAll();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao criar convite');
    } finally { setCreating(false); }
  }

  async function handleRevoke(id: string) {
    if (!await confirm('O convite será apagado permanentemente.', { title: 'Revogar convite?', confirmText: 'Revogar', danger: true })) return;
    await api.admin.revokeInvitation(id);
    await loadAll();
  }

  function copyInviteLink(token: string, id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/register?token=${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleToggleRole(user: AdminUser) {
    if (user.role === 'admin') {
      if (!await confirm(`${user.name} perderá acesso à área admin.`, { title: 'Rebaixar a usuário?', confirmText: 'Rebaixar', danger: true })) return;
      await api.admin.demoteToUser(user.id);
    } else {
      if (!await confirm(`${user.name} terá acesso total à área admin.`, { title: 'Promover a admin?', confirmText: 'Promover' })) return;
      await api.admin.promoteToAdmin(user.id);
    }
    await loadAll();
  }

  async function handleImpersonate(user: AdminUser) {
    if (!await confirm('Você verá o sistema como esse usuário.', { title: `Personificar ${user.name}?`, confirmText: 'Personificar' })) return;
    try {
      const res = await api.admin.impersonate(user.id);
      startImpersonation(res.token, res.user);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao personificar');
    }
  }

  if (loading) return <AdminSkeleton />;

  const activeInvites = invitations.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date());
  const usedOrExpired = invitations.filter((i) => i.usedAt || new Date(i.expiresAt) <= new Date());

  const filteredUsers = userSearch.trim()
    ? users.filter((u) => {
        const q = userSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      })
    : users;

  const visibleUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 5);

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administração</h1>
          <p className="text-muted-foreground text-sm">Gerencie convites e usuários do sistema.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll}>
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </Button>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="flex">
          <TabButton
            active={tab === 'users'}
            onClick={() => setTab('users')}
            label="Usuários"
            count={users.length}
          />
          <TabButton
            active={tab === 'invites'}
            onClick={() => setTab('invites')}
            label="Convites"
            count={activeInvites.length}
          />
        </div>
      </div>

      {/* ── Tab: Usuários ─────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {users.length} conta{users.length !== 1 ? 's' : ''} registrada{users.length !== 1 ? 's' : ''}
            </p>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail"
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {filteredUsers.length === 0 && userSearch && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma conta para &ldquo;{userSearch}&rdquo;
            </p>
          )}

          <div className="space-y-2">
            {visibleUsers.map((u) => {
              const activeIntegrations = u.integrations.filter((i) => i.isActive);
              return (
                <Card key={u.id}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={u.name} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{u.name}</span>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                            {u.role === 'admin' ? 'Admin' : 'Usuário'}
                          </Badge>
                          {activeIntegrations.length > 0 && (
                            <Badge variant="muted" className="text-[10px]">
                              {activeIntegrations.length} integração{activeIntegrations.length !== 1 ? 'ões' : ''}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <Link href={`/dashboard/admin/audit-logs?userId=${u.id}`}>
                          <IconButton icon={ClipboardList} title="Ver logs deste usuário" onClick={() => {}} />
                        </Link>
                        <IconButton
                          icon={UserCheck}
                          title="Personificar este usuário"
                          onClick={() => handleImpersonate(u)}
                        />
                        {u.id !== currentUserId && (
                          <IconButton
                            icon={u.role === 'admin' ? ShieldOff : ShieldCheck}
                            title={u.role === 'admin' ? 'Rebaixar a usuário' : 'Promover a admin'}
                            variant={u.role === 'admin' ? 'destructive' : 'promote'}
                            onClick={() => handleToggleRole(u)}
                          />
                        )}
                      </div>
                    </div>

                    {activeIntegrations.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="integrations" className="border rounded-md px-3">
                          <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
                            <span className="flex items-center gap-1.5">
                              <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" />
                              Integrações ativas ({activeIntegrations.length})
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <IntegrationTable integrations={activeIntegrations} />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {activeIntegrations.length === 0 && (
                      <p className="text-xs text-muted-foreground pl-1">Nenhuma integração ativa.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredUsers.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground text-xs"
                onClick={() => setShowAllUsers((v) => !v)}
              >
                {showAllUsers
                  ? 'Mostrar menos'
                  : `Ver mais ${filteredUsers.length - 5} conta${filteredUsers.length - 5 !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Convites ─────────────────────────────────────────────────── */}
      {tab === 'invites' && (
        <div className="space-y-6">

          {/* Criar convite */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Novo Convite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="E-mail (opcional — convite aberto se vazio)"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={creating}>
                  <Plus className="w-4 h-4" />
                  {creating ? 'Criando...' : 'Criar'}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">Validade: 7 dias.</p>
            </CardContent>
          </Card>

          {/* Convites ativos */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              Ativos
              {activeInvites.length > 0 && <Badge variant="success">{activeInvites.length}</Badge>}
            </h2>

            {activeInvites.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum convite ativo.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {activeInvites.map((inv) => (
                  <Card key={inv.id}>
                    <CardContent className="py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {inv.email ?? <span className="italic text-muted-foreground font-normal">Convite aberto</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expira em {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => copyInviteLink(inv.token, inv.id)}>
                          <Copy className="w-3.5 h-3.5" />
                          {copiedId === inv.id ? 'Copiado!' : 'Copiar link'}
                        </Button>
                        <IconButton
                          icon={Trash2}
                          title="Revogar convite"
                          variant="destructive"
                          onClick={() => handleRevoke(inv.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Histórico */}
          {usedOrExpired.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="history" className="border rounded-xl px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Histórico
                    <Badge variant="secondary" className="text-[10px]">{usedOrExpired.length}</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-1.5">
                    {usedOrExpired.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/40 text-xs text-muted-foreground"
                      >
                        <span>{inv.email ?? 'Convite aberto'}</span>
                        <Badge variant={inv.usedAt ? 'secondary' : 'outline'} className="text-[10px]">
                          {inv.usedAt ? 'Usado' : 'Expirado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}
