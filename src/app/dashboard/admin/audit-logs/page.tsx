'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, RefreshCw, X, ClipboardList, Info } from 'lucide-react';
import { api, AuditLog, AdminUser } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const SCREENS = [
  { value: '', label: 'Todas as telas' },
  { value: 'auth.', label: 'Autenticação' },
  { value: 'integration.', label: 'Integrações' },
  { value: 'settings.', label: 'Configurações' },
  { value: 'admin.', label: 'Admin' },
];

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({ log, userName, onClose }: { log: AuditLog; userName?: string; onClose: () => void }) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: 'ID', value: <span className="font-mono">{log.id}</span> },
    { label: 'Ação', value: <span className="font-mono font-semibold">{log.action}</span> },
    { label: 'Usuário', value: userName ? `${userName} (${log.userId})` : log.userId ?? <em className="text-muted-foreground">anônimo</em> },
    {
      label: 'Personificado por',
      value: log.impersonatedBy
        ? <span className="font-mono">{log.impersonatedBy}</span>
        : <em className="text-muted-foreground">—</em>,
    },
    { label: 'ID do alvo', value: log.targetId ? <span className="font-mono">{log.targetId}</span> : <em className="text-muted-foreground">—</em> },
    { label: 'Tipo do alvo', value: log.targetType ?? <em className="text-muted-foreground">—</em> },
    { label: 'IP', value: log.ipAddress ? <span className="font-mono">{log.ipAddress}</span> : <em className="text-muted-foreground">—</em> },
    { label: 'Data/Hora', value: new Date(log.createdAt).toLocaleString('pt-BR') },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4" />
            Detalhes do registro
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-muted-foreground font-medium shrink-0">{label}</span>
              <span className="text-foreground break-all">{value}</span>
            </div>
          ))}

          {/* Metadata */}
          <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
            <span className="text-muted-foreground font-medium shrink-0 pt-0.5">Metadata</span>
            {log.metadata ? (
              <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto text-foreground font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            ) : (
              <em className="text-muted-foreground text-sm">—</em>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  return (
    <Suspense>
      <AuditLogsContent />
    </Suspense>
  );
}

function AuditLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [userId, setUserId] = useState(searchParams.get('userId') ?? '');
  const [screen, setScreen] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    api.admin.listUsers().then(setUsers).catch(() => {});
  }, [router]);

  const fetchLogs = useCallback(async (opts: {
    userId?: string; screen?: string; search?: string; page?: number;
  } = {}) => {
    setLoading(true);
    try {
      const data = await api.admin.getAuditLogs({
        userId: opts.userId !== undefined ? opts.userId || undefined : userId || undefined,
        screen: opts.screen !== undefined ? opts.screen || undefined : screen || undefined,
        search: opts.search !== undefined ? opts.search || undefined : search || undefined,
        page: opts.page ?? page,
        limit: 50,
      });
      setLogs(data);
      if (opts.page) setPage(opts.page);
    } catch { /* silence */ }
    finally { setLoading(false); }
  }, [userId, screen, search, page]);

  useEffect(() => { fetchLogs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilters(overrides: { userId?: string; screen?: string; search?: string } = {}) {
    const u = overrides.userId !== undefined ? overrides.userId : userId;
    const s = overrides.screen !== undefined ? overrides.screen : screen;
    const q = overrides.search !== undefined ? overrides.search : search;
    setPage(1);
    setLoading(true);
    api.admin.getAuditLogs({
      userId: u || undefined,
      screen: s || undefined,
      search: q || undefined,
      page: 1,
      limit: 50,
    }).then((data) => { setLogs(data); setPage(1); }).catch(() => {}).finally(() => setLoading(false));
  }

  function changePage(next: number) {
    setLoading(true);
    api.admin.getAuditLogs({
      userId: userId || undefined,
      screen: screen || undefined,
      search: search || undefined,
      page: next,
      limit: 50,
    }).then((data) => { setLogs(data); setPage(next); }).catch(() => {}).finally(() => setLoading(false));
  }

  function clearFilters() {
    setUserId('');
    setScreen('');
    setSearch('');
    setPage(1);
    setLoading(true);
    api.admin.getAuditLogs({ page: 1, limit: 50 })
      .then((data) => { setLogs(data); setPage(1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  const activeFilterCount = [userId, screen, search].filter(Boolean).length;
  const selectedUserName = users.find((u) => u.id === userId)?.name;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Audit Log
          </h1>
          <p className="text-muted-foreground text-sm">Histórico de todas as ações realizadas no sistema.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchLogs()} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-xs text-muted-foreground font-medium w-full sm:w-auto">Filtros</label>

            <select
              value={userId}
              onChange={(e) => { setUserId(e.target.value); applyFilters({ userId: e.target.value }); }}
              className="h-8 text-sm rounded-md border border-input bg-background px-2 text-foreground min-w-[180px]"
            >
              <option value="">Todos os usuários</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>

            <select
              value={screen}
              onChange={(e) => { setScreen(e.target.value); applyFilters({ screen: e.target.value }); }}
              className="h-8 text-sm rounded-md border border-input bg-background px-2 text-foreground"
            >
              {SCREENS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {activeFilterCount > 0 && (
              <Button size="sm" variant="ghost" onClick={clearFilters} className="text-muted-foreground h-8">
                <X className="w-3.5 h-3.5 mr-1" />
                Limpar filtros
                <Badge variant="secondary" className="ml-1.5 text-[10px]">{activeFilterCount}</Badge>
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applyFilters({ search }); }}
                placeholder="Buscar por ação, ID do alvo…"
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Button size="sm" variant="outline" onClick={() => applyFilters({ search })}>
              Buscar
            </Button>
          </div>

          {(userId || screen || search) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {userId && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 text-primary rounded-full px-2.5 py-0.5">
                  Usuário: <strong>{selectedUserName ?? userId.slice(0, 8) + '…'}</strong>
                  <button onClick={() => { setUserId(''); applyFilters({ userId: '' }); }}>
                    <X className="w-3 h-3 hover:text-destructive" />
                  </button>
                </span>
              )}
              {screen && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 text-primary rounded-full px-2.5 py-0.5">
                  Tela: <strong>{SCREENS.find((s) => s.value === screen)?.label}</strong>
                  <button onClick={() => { setScreen(''); applyFilters({ screen: '' }); }}>
                    <X className="w-3 h-3 hover:text-destructive" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 text-primary rounded-full px-2.5 py-0.5">
                  Texto: <strong>&ldquo;{search}&rdquo;</strong>
                  <button onClick={() => { setSearch(''); applyFilters({ search: '' }); }}>
                    <X className="w-3 h-3 hover:text-destructive" />
                  </button>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Log table ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Carregando…</div>
      ) : logs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum registro encontrado com os filtros aplicados.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_160px_120px_130px_36px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border">
            <span>Ação</span>
            <span>Usuário</span>
            <span>IP</span>
            <span className="text-right">Data/Hora</span>
            <span />
          </div>

          {/* Rows */}
          {logs.map((log) => {
            const userName = users.find((u) => u.id === log.userId)?.name;
            return (
              <div
                key={log.id}
                className="grid grid-cols-[1fr_160px_120px_130px_36px] gap-3 px-4 py-2.5 text-xs border-b border-border last:border-0 hover:bg-muted/30 transition-colors items-center"
              >
                {/* Action + target */}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-foreground font-medium">{log.action}</span>
                    {log.impersonatedBy && (
                      <Badge variant="secondary" className="text-[10px]">personificado</Badge>
                    )}
                  </div>
                  {log.targetId && (
                    <span className="text-muted-foreground font-mono">
                      {log.targetId.length > 20 ? log.targetId.slice(0, 20) + '…' : log.targetId}
                    </span>
                  )}
                </div>

                {/* User */}
                <div className="min-w-0">
                  {log.userId ? (
                    <button
                      className="text-foreground hover:text-primary hover:underline truncate block w-full text-left"
                      onClick={() => { setUserId(log.userId!); applyFilters({ userId: log.userId! }); }}
                      title="Filtrar por este usuário"
                    >
                      {userName ?? log.userId.slice(0, 12) + '…'}
                    </button>
                  ) : (
                    <span className="text-muted-foreground italic">anônimo</span>
                  )}
                </div>

                {/* IP */}
                <span className="text-muted-foreground font-mono truncate">{log.ipAddress ?? '—'}</span>

                {/* Date */}
                <span className="text-muted-foreground text-right tabular-nums">
                  {new Date(log.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>

                {/* Detail button */}
                <button
                  onClick={() => setSelectedLog(log)}
                  title="Ver detalhes"
                  className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => changePage(page - 1)}>
            ← Anterior
          </Button>
          <span className="text-xs text-muted-foreground">Página {page}</span>
          <Button variant="ghost" size="sm" disabled={logs.length < 50} onClick={() => changePage(page + 1)}>
            Próxima →
          </Button>
        </div>
      )}

      {/* ── Detail modal ─────────────────────────────────────────────────────── */}
      {selectedLog && (
        <DetailModal
          log={selectedLog}
          userName={users.find((u) => u.id === selectedLog.userId)?.name}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
