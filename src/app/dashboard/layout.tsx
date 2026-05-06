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
  );
}
