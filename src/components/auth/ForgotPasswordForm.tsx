'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-g font-medium">Verifique seu e-mail</p>
        <p className="text-sm text-muted-foreground">
          Se <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Voltar para o login
          </Link>
        </p>
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
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Enviar link de recuperação'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}
