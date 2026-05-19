'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Link2, KeyRound, FileText, LogOut, ShieldCheck,
  UserX, ClipboardList, SlidersHorizontal, Moon, Sun, Menu, X, Webhook,
} from 'lucide-react';
import { isAuthenticated, getUser, clearToken, isAdmin, isImpersonating, stopImpersonation } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/integrations', label: 'Integrações', icon: Link2 },
  { href: '/dashboard/settings', label: 'Token ERP', icon: KeyRound },
  { href: '/dashboard/webhook-tester', label: 'Teste Webhook', icon: Webhook },
];

const adminNavItems = [
  { href: '/dashboard/admin', label: 'Admin', icon: ShieldCheck, exact: true },
  { href: '/dashboard/admin/audit-logs', label: 'Audit Log', icon: ClipboardList, exact: false },
  { href: '/dashboard/admin/marketplace-configs', label: 'Config. APIs', icon: SlidersHorizontal, exact: false },
];

function navLinkClass(active: boolean) {
  return cn(
    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
    active ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 select-none">
      {initials}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [admin, setAdmin] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonatingName, setImpersonatingName] = useState('');
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Close drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

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
    <>
      <noscript>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 1.75rem', display: 'block' }}>
              <circle cx="40" cy="40" r="39" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.25" />
              <circle cx="40" cy="40" r="30" fill="#f59e0b" fillOpacity="0.08" />
              <path d="M40 20 L62 58 H18 Z" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" fill="#f59e0b" fillOpacity="0.12" />
              <rect x="37.5" y="33" width="5" height="13" rx="2.5" fill="#f59e0b" />
              <circle cx="40" cy="52" r="2.75" fill="#f59e0b" />
            </svg>
            <h1 style={{ color: '#f8fafc', fontSize: '1.375rem', fontWeight: 700, margin: '0 0 0.875rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              JavaScript necessário
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: '0 0 1.75rem' }}>
              O <strong style={{ color: '#cbd5e1', fontWeight: 600 }}>Hub RAM</strong> é
              uma aplicação interativa e requer JavaScript para funcionar corretamente.
              Ative-o nas configurações do seu navegador e recarregue a página.
            </p>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.01em', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
              Recarregar página
            </a>
          </div>
        </div>
      </noscript>

      <div className="min-h-screen bg-background">

        {/* ── Impersonation banner ─────────────────────────────────────────── */}
        {impersonating && (
          <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-amber-500 flex items-center justify-between px-4 shadow-md">
            <div className="flex items-center gap-2 text-amber-950 font-semibold text-sm">
              <UserX className="w-4 h-4 shrink-0" />
              Personificando <strong className="underline underline-offset-2">{impersonatingName}</strong>
              <span className="font-normal opacity-75 text-xs hidden sm:inline">— você está vendo o sistema como este usuário</span>
            </div>
            <button
              onClick={handleStopImpersonation}
              className="text-xs font-semibold text-amber-950 bg-amber-950/15 hover:bg-amber-950/25 rounded px-3 py-1 transition-colors"
            >
              Sair
            </button>
          </div>
        )}

        {/* ── Mobile top header ────────────────────────────────────────────── */}
        <header className={cn(
          'lg:hidden fixed left-0 right-0 z-20 h-14 bg-card border-b border-border flex items-center justify-between px-4',
          impersonating ? 'top-10' : 'top-0',
        )}>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Abrir menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Image src="/RAMHub.svg" alt="Hub RAM" width={100} height={28} className="h-7 w-auto" />
          <button
            onClick={toggleDark}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* ── Backdrop (mobile only) ───────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar / Drawer ─────────────────────────────────────────────── */}
        <aside className={cn(
          'fixed left-0 bottom-0 top-0 w-64 bg-card border-r border-border flex flex-col z-40',
          'transition-transform duration-300 ease-in-out',
          impersonating && 'lg:top-10',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}>
          {/* Sidebar header — desktop only (mobile has its own top bar) */}
          <div className="h-16 hidden lg:flex items-center justify-between px-6 border-b border-border">
            <Image src="/RAMHub.svg" alt="Hub RAM" width={120} height={32} className="h-8 w-auto" />
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile sidebar header (close button + logo) */}
          <div className="h-14 lg:hidden flex items-center justify-between px-4 border-b border-border">
            <Image src="/RAMHub.svg" alt="Hub RAM" width={100} height={28} className="h-7 w-auto" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-accent transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={navLinkClass(pathname === href)}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}

            <a
              href={`${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/api/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className={navLinkClass(false)}
            >
              <FileText className="w-4 h-4 shrink-0" />
              Documentação
            </a>

            {admin && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <Separator className="mb-2" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</span>
                </div>
                {adminNavItems.map(({ href, label, icon: Icon, exact }) => (
                  <Link key={href} href={href} className={navLinkClass(exact ? pathname === href : pathname.startsWith(href))}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="p-3 border-t border-border">
            {user && (
              <div className="px-3 py-2 mb-1 flex items-center gap-3">
                <UserAvatar name={user.name} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
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

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className={cn(
          'lg:ml-64 min-h-screen p-6 lg:p-8',
          impersonating ? 'pt-24 lg:pt-8 lg:mt-10' : 'pt-20 lg:pt-8',
        )}>
          {children}
        </main>
      </div>
    </>
  );
}
