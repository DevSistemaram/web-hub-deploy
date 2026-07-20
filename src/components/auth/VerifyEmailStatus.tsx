'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type VerifyState = { status: 'loading' } | { status: 'success' } | { status: 'error'; reason: string };

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<VerifyState>({ status: 'loading' });

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', reason: 'Link de verificação ausente.' });
      return;
    }

    api.auth.verifyEmail(token)
      .then(() => setState({ status: 'success' }))
      .catch((err) => {
        setState({ status: 'error', reason: err instanceof Error ? err.message : 'Erro ao verificar e-mail.' });
      });
  }, [token]);

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Verificando e-mail...</span>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-g text-destructive font-medium">{state.reason}</p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Voltar para o login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3 py-4">
      <p className="text-g font-medium">E-mail verificado com sucesso!</p>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Entrar agora
        </Link>
      </p>
    </div>
  );
}
