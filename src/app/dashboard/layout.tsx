'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Link2, KeyRound, FileText, LogOut, ShieldCheck, UserX, ClipboardList, SlidersHorizontal } from 'lucide-react';
import { isAuthenticated, getUser, clearToken, isAdmin, isImpersonating, stopImpersonation } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/integrations', label: 'Integrações', icon: Link2 },
  { href: '/dashboard/settings', label: 'Token ERP', icon: KeyRound },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [admin, setAdmin] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonatingName, setImpersonatingName] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
    setAdmin(isAdmin());
    const imp = isImpersonating();
    setImpersonating(imp);
    if (imp) setImpersonatingName(getUser()?.name ?? '');
  }, [router]);

  function handleStopImpersonation() {
    stopImpersonation();
    router.push('/dashboard/admin');
    router.refresh();
  }

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <html lang="pt-BR">
      <body>
        <noscript>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px' }}>
              <svg
                width="80" height="80" viewBox="0 0 80 80" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ margin: '0 auto 1.75rem', display: 'block' }}
              >
                <circle cx="40" cy="40" r="39" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.25" />
                <circle cx="40" cy="40" r="30" fill="#f59e0b" fillOpacity="0.08" />
                <path
                  d="M40 20 L62 58 H18 Z"
                  stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round"
                  fill="#f59e0b" fillOpacity="0.12"
                />
                <rect x="37.5" y="33" width="5" height="13" rx="2.5" fill="#f59e0b" />
                <circle cx="40" cy="52" r="2.75" fill="#f59e0b" />
              </svg>
              <h1 style={{
                color: '#f8fafc', fontSize: '1.375rem', fontWeight: 700,
                margin: '0 0 0.875rem', letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>
                JavaScript necessário
              </h1>
              <p style={{
                color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7,
                margin: '0 0 1.75rem',
              }}>
                O <strong style={{ color: '#cbd5e1', fontWeight: 600 }}>Hub RAM</strong> é
                uma aplicação interativa e requer JavaScript para funcionar corretamente.
                Ative-o nas configurações do seu navegador e recarregue a página.
              </p>
              <a
                href="/"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 1.5rem',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#0f172a', borderRadius: '0.625rem',
                  fontWeight: 700, fontSize: '0.875rem',
                  textDecoration: 'none', letterSpacing: '0.01em',
                  boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
                }}
              >
                Recarregar página
              </a>
            </div>
          </div>
        </noscript>
        <div className="min-h-screen bg-background">

          {/* ── Impersonation banner — fixed full-width above everything ──────── */}
          {impersonating && (
            <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-amber-500 flex items-center justify-between px-4 shadow-md">
              <div className="flex items-center gap-2 text-amber-950 font-semibold text-sm">
                <UserX className="w-4 h-4 shrink-0" />
                Personificando <strong className="underline underline-offset-2">{impersonatingName}</strong>
                <span className="font-normal opacity-75 text-xs">— você está vendo o sistema como este usuário</span>
              </div>
              <button
                onClick={handleStopImpersonation}
                className="text-xs font-semibold text-amber-950 bg-amber-950/15 hover:bg-amber-950/25 rounded px-3 py-1 transition-colors"
              >
                Sair da personificação
              </button>
            </div>
          )}

          <aside
            className={cn(
              'fixed left-0 w-64 bg-card border-r border-border flex flex-col z-10',
              impersonating ? 'top-10 bottom-0' : 'inset-y-0',
            )}
          >
            <div className="h-16 flex items-center px-6 border-b border-border">
              <Image src="/RAMHub.svg" alt="Hub RAM" width={120} height={32} className="h-8 w-auto" />
            </div>

            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}

              {admin && (
                <>
                  <Link
                    href="/dashboard/admin"
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname === '/dashboard/admin'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    Admin
                  </Link>
                  <Link
                    href="/dashboard/admin/audit-logs"
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname.startsWith('/dashboard/admin/audit-logs')
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    Audit Log
                  </Link>
                  <Link
                    href="/dashboard/admin/marketplace-configs"
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname.startsWith('/dashboard/admin/marketplace-configs')
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <SlidersHorizontal className="w-4 h-4 shrink-0" />
                    Config. APIs
                  </Link>
                </>
              )}

              <a
                href={`${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/api/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <FileText className="w-4 h-4 shrink-0" />
                Documentação
              </a>
            </nav>

            <div className="p-3 border-t border-border">
              {user && (
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </aside>

          <main className={cn('ml-64 min-h-screen p-8', impersonating && 'mt-10')}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
