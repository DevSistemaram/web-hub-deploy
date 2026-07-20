'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { saveToken, isAuthenticated } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const UNVERIFIED_EMAIL_ERROR = 'Confirme seu e-mail antes de entrar';

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(returnTo);
    }
  }, [router, returnTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResendSent(false);
    setLoading(true);
    try {
      const result = await api.auth.login(form);
      saveToken(result.token, result.user);
      router.push(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResending(true);
    try {
      await api.auth.resendVerification(form.email);
      setResendSent(true);
    } catch {
      setResendSent(true);
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 space-y-2">
          <p>{error}</p>
          {error === UNVERIFIED_EMAIL_ERROR && (
            resendSent ? (
              <p className="text-muted-foreground">
                Se o e-mail existir e ainda não estiver verificado, enviamos um novo link.
              </p>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resending}
                onClick={handleResendVerification}
              >
                {resending ? 'Reenviando...' : 'Reenviar email de verificação'}
              </Button>
            )
          )}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="seu@email.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline font-medium">
          Esqueci minha senha
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
