'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InviteState =
  | { status: 'loading' }
  | { status: 'invalid'; reason: string }
  | { status: 'valid'; email: string | null };

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('token') ?? '';

  const [invite, setInvite] = useState<InviteState>({ status: 'loading' });
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inviteToken) {
      setInvite({ status: 'invalid', reason: 'Link de convite ausente.' });
      return;
    }

    api.auth.validateInvite(inviteToken).then((res) => {
      if (res.valid) {
        setInvite({ status: 'valid', email: res.email ?? null });
        if (res.email) setForm((f) => ({ ...f, email: res.email! }));
      } else {
        setInvite({ status: 'invalid', reason: res.reason ?? 'Convite inválido.' });
      }
    }).catch(() => {
      setInvite({ status: 'invalid', reason: 'Erro ao validar convite.' });
    });
  }, [inviteToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.auth.register({ ...form, inviteToken });
      saveToken(result.token, result.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  if (invite.status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Verificando convite...</span>
      </div>
    );
  }

  if (invite.status === 'invalid') {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-sm text-destructive font-medium">{invite.reason}</p>
        <p className="text-sm text-muted-foreground">
          Solicite um novo convite ao administrador do sistema.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline font-medium">
          Já tem conta? Entrar
        </Link>
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
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Seu nome"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="seu@email.com"
          readOnly={!!invite.email}
          className={invite.email ? 'bg-muted cursor-not-allowed' : ''}
        />
        {invite.email && (
          <p className="text-xs text-muted-foreground">Este convite foi emitido para este e-mail.</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Criando conta...' : 'Criar conta'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </form>
  );
}
