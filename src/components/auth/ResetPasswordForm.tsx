'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(Boolean(token));
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenReason, setTokenReason] = useState('Link de recuperação inválido.');

  useEffect(() => {
    if (!token) return;

    api.auth
      .validateResetToken(token)
      .then((result) => {
        setTokenValid(result.valid);
        if (!result.valid && result.reason) setTokenReason(result.reason);
      })
      .catch(() => {
        setTokenValid(false);
      })
      .finally(() => setChecking(false));
  }, [token]);

  if (!token) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-g text-destructive font-medium">Link de recuperação inválido.</p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:underline font-medium">
            Solicitar novo link
          </Link>
        </p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Verificando link...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-g text-destructive font-medium">{tokenReason}</p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:underline font-medium">
            Solicitar novo link
          </Link>
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-g font-medium">Senha redefinida com sucesso!</p>
        <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Redefinindo...' : 'Redefinir senha'}
      </Button>
    </form>
  );
}
