'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, KeyRound, ShoppingCart, ShoppingBag } from 'lucide-react';
import { api, Integration } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.integrations.list()
      .then(setIntegrations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const mlCount = integrations.filter((i) => i.marketplace === 'mercadolivre').length;
  const shopeeCount = integrations.filter((i) => i.marketplace === 'shopee').length;
  const hasAny = integrations.length > 0;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Visão Geral</h1>
      <p className="text-muted-foreground mb-8">Status das suas integrações e configurações.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatusCard title="Mercado Livre" icon={ShoppingCart} count={mlCount} loading={loading} />
        <StatusCard title="Shopee" icon={ShoppingBag} count={shopeeCount} loading={loading} />

        <Card>
          <CardContent className="pt-5 pb-5">
            <KeyRound className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-semibold text-foreground text-sm">Token ERP</p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">Configure o acesso ao ERP</p>
            <Button variant="link" size="sm" className="p-0 h-auto text-primary" asChild>
              <Link href="/dashboard/settings">
                Gerenciar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {!loading && !hasAny && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <p className="font-semibold text-foreground mb-1">Configure suas integrações</p>
            <p className="text-sm text-muted-foreground mb-4">
              Vincule suas contas do Mercado Livre e/ou Shopee para começar a receber pedidos.
            </p>
            <Button asChild>
              <Link href="/dashboard/integrations">Configurar integrações</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusCard({ title, icon: Icon, count, loading }: {
  title: string;
  icon: React.ElementType;
  count: number;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <Icon className="w-5 h-5 text-primary" />
          {!loading && (
            <Badge variant={count > 0 ? 'success' : 'muted'}>
              {count > 0 ? `${count === 1 ? 'loja' : 'lojas'}` : 'Inativo'}
            </Badge>
          )}
        </div>
        {loading ? (
          <Skeleton className="h-8 w-12 mb-1" />
        ) : (
          <p className="text-3xl font-bold text-foreground">{count}</p>
        )}
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
      </CardContent>
    </Card>
  );
}
