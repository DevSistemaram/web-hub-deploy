'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy, Trash2, ShieldCheck, ShieldOff, RefreshCw,
  Plus, ShoppingCart, ShoppingBag, UserCheck, Search, ClipboardList,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { api, Invitation, AdminUser, Integration } from '@/lib/api';
import { isAdmin, startImpersonation, getUser } from '@/lib/auth';
import { confirm, toastError } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

function IntegrationTable({ integrations }: { integrations: Integration[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Loja</th>
            <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Marketplace</th>
            <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Access Token</th>
            <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Refresh Token</th>
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
                <td className="py-2 px-2">
                  <TokenBadge expiresAt={int.tokenExpiresAt} />
                </td>
                <td className="py-2 px-2">
                  <TokenBadge expiresAt={int.refreshTokenExpiresAt} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
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
      if (!await confirm(`${user.name} terá acesso total à área admin.`, { title: 'Promover a admin?' , confirmText: 'Promover' })) return;
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

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  const activeInvites = invitations.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date());
  const usedOrExpired = invitations.filter((i) => i.usedAt || new Date(i.expiresAt) <= new Date());

  const filteredUsers = userSearch.trim()
    ? users.filter((u) => {
        const q = userSearch.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      })
    : users;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Administração</h1>
        <p className="text-muted-foreground text-sm">Gerencie convites, usuários e integrações.</p>
      </div>

      {/* ── Criar convite ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Novo Convite</CardTitle>
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

      {/* ── Convites ativos ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Convites ativos
            {activeInvites.length > 0 && <Badge variant="success" className="ml-2">{activeInvites.length}</Badge>}
          </h2>
          <Button variant="ghost" size="sm" onClick={loadAll}><RefreshCw className="w-3.5 h-3.5" /></Button>
        </div>

        {activeInvites.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhum convite ativo.</CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeInvites.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {inv.email ?? <span className="italic text-muted-foreground">Convite aberto</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expira em {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => copyInviteLink(inv.token, inv.id)}>
                      <Copy className="w-3.5 h-3.5" />
                      {copiedId === inv.id ? 'Copiado!' : 'Copiar link'}
                    </Button>
                    <Button
                      size="icon" variant="outline" onClick={() => handleRevoke(inv.id)}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Contas e integrações ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Contas ({users.length})
          </h2>
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
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma conta encontrada para &ldquo;{userSearch}&rdquo;
          </p>
        )}

        <div className="space-y-3">
          {(showAllUsers ? filteredUsers : filteredUsers.slice(0, 5)).map((u) => (
            <Card key={u.id}>
              <CardContent className="py-4 space-y-3">
                {/* User header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role === 'admin' ? 'Admin' : 'Usuário'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Link href={`/dashboard/admin/audit-logs?userId=${u.id}`}>
                      <Button size="sm" variant="outline" title="Ver logs deste usuário">
                        <ClipboardList className="w-3.5 h-3.5" />
                        Logs
                      </Button>
                    </Link>
                    <Button
                      size="sm" variant="outline"
                      onClick={() => handleImpersonate(u)}
                      title="Personificar este usuário"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Personificar
                    </Button>
                    {u.id !== currentUserId && (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => handleToggleRole(u)}
                        title={u.role === 'admin' ? 'Rebaixar a usuário' : 'Promover a admin'}
                      >
                        {u.role === 'admin'
                          ? <><ShieldOff className="w-3.5 h-3.5" /> Rebaixar</>
                          : <><ShieldCheck className="w-3.5 h-3.5" /> Promover</>
                        }
                      </Button>
                    )}
                  </div>
                </div>

                {/* Integrations */}
                {(() => {
                  const activeIntegrations = u.integrations.filter((i) => i.isActive);
                  if (activeIntegrations.length === 0) {
                    return <p className="text-xs text-muted-foreground pl-1">Nenhuma integração ativa.</p>;
                  }
                  return (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="integrations" className="border rounded-md px-3">
                        <AccordionTrigger className="py-2 text-xs font-medium hover:no-underline">
                          Integrações ativas ({activeIntegrations.length})
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                          <IntegrationTable integrations={activeIntegrations} />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })()}
              </CardContent>
            </Card>
          ))}
          {filteredUsers.length > 5 && (
            <Button
              variant="ghost" size="sm"
              className="w-full text-muted-foreground text-xs"
              onClick={() => setShowAllUsers((v) => !v)}
            >
              {showAllUsers
                ? 'Mostrar menos'
                : `Ver mais ${filteredUsers.length - 5} conta${filteredUsers.length - 5 > 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      </div>

      {/* ── Histórico de convites ──────────────────────────────────────────── */}
      {usedOrExpired.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Histórico ({usedOrExpired.length} usados/expirados)
          </h2>
          <div className="space-y-1.5">
            {usedOrExpired.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/40 text-sm text-muted-foreground">
                <span>{inv.email ?? 'Convite aberto'}</span>
                <Badge variant={inv.usedAt ? 'secondary' : 'outline'}>
                  {inv.usedAt ? 'Usado' : 'Expirado'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
