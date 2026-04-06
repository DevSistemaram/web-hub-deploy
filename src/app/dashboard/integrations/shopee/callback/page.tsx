'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function ShopeeCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    const shopId = searchParams.get('shop_id');

    if (!code || !shopId) {
      setErrorMessage('Parâmetros de autorização incompletos. Tente vincular novamente.');
      setStatus('error');
      return;
    }

    api.integrations.handleShopeeCallback(code, shopId)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/dashboard/integrations'), 2000);
      })
      .catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : 'Falha ao vincular Shopee.');
        setStatus('error');
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-10 pb-10 text-center">
          {status === 'loading' && (
            <>
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Vinculando Shopee...</h2>
              <p className="text-sm text-muted-foreground mb-6">Aguarde enquanto confirmamos a autorização.</p>
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Shopee vinculada!</h2>
              <p className="text-sm text-muted-foreground">Redirecionando para suas integrações...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Erro ao vincular</h2>
              <p className="text-sm text-destructive mb-6">{errorMessage}</p>
              <Button onClick={() => router.push('/dashboard/integrations')}>
                Voltar para Integrações
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ShopeeCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <ShopeeCallback />
    </Suspense>
  );
}
