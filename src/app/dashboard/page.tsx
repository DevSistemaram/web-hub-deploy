'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Link2, KeyRound, ShieldCheck } from 'lucide-react';
import { api, Integration } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconCard } from '@/components/ui/icon-card';

type DashboardMarketplace = Exclude<Integration['marketplace'], 'zedeliver'>;

const MARKETPLACE_LABELS: Record<DashboardMarketplace, string> = {
  mercadolivre: 'Mercado Livre',
  shopee: 'Shopee',
  ideris: 'Ideris',
  nuvemshop: 'Nuvemshop',
  ifood: 'iFood',
  uairango: 'UaiRango',
  amazon: 'Amazon',
};

const CATEGORIES: { label: string; items: DashboardMarketplace[] }[] = [
  { label: 'Marketplace', items: ['mercadolivre', 'shopee', 'amazon'] },
  { label: 'Catálogo', items: ['nuvemshop'] },
  { label: 'Hubs', items: ['ideris'] },
  { label: 'Food', items: ['ifood', 'uairango'] },
];

const MARKETPLACES = Object.keys(MARKETPLACE_LABELS) as DashboardMarketplace[];

const SHORTCUTS = [
  { href: '/dashboard/vendas', icon: FileSpreadsheet, title: 'Vendas', description: 'Exporte pedidos por período e integração.' },
  { href: '/dashboard/integrations', icon: Link2, title: 'Integrações', description: 'Conecte e gerencie seus marketplaces.' },
  { href: '/dashboard/settings', icon: KeyRound, title: 'Token ERP', description: 'Gere e revogue tokens de acesso ao ERP.' },
];

export default function DashboardPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
    api.integrations.list()
      .then(setIntegrations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const connectedMarketplaces = new Set(
    integrations.filter((i) => i.isActive).map((i) => i.marketplace),
  );
  const connectedCount = connectedMarketplaces.size;

  const shortcuts = admin
    ? [...SHORTCUTS, { href: '/dashboard/admin', icon: ShieldCheck, title: 'Admin', description: 'Usuários, convites e configurações administrativas.' }]
    : SHORTCUTS;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Visão Geral</h1>
      <p className="text-muted-foreground mb-8">Status das suas integrações e configurações.</p>

      <section className="mb-8">
        {loading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : (
          <Link href="/dashboard/integrations">
            <Card className="transition hover:border-primary/40 hover:shadow-md">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-foreground">
                  {connectedCount} de {MARKETPLACES.length} integrações conectadas
                </p>
                <div className="mt-4 space-y-4">
                  {CATEGORIES.map((category) => (
                    <div key={category.label}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {category.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((marketplace) => (
                          <Badge
                            key={marketplace}
                            variant={connectedMarketplaces.has(marketplace) ? 'success' : 'outline'}
                          >
                            {MARKETPLACE_LABELS[marketplace]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Atalhos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map(({ href, icon, title, description }) => (
            <Link key={href} href={href}>
              <IconCard icon={icon} title={title} description={description} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
