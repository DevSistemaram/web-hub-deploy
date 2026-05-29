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

    </div>
  );
}
