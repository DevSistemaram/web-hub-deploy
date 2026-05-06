import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  'Conecte ao Mercado Livre e Shopee em minutos',
  'Pedidos centralizados em formato padronizado',
  'Integração nativa com o ERP Sistema RAM',
];

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
      <div>
        <Image
          src="/RAMHub.svg"
          alt="Hub RAM"
          width={140}
          height={40}
          className="h-10 w-auto brightness-0 invert"
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold leading-snug">
            Seu ERP conectado aos maiores marketplaces do Brasil.
          </h2>
          <p className="mt-3 text-primary-foreground/70 text-sm leading-relaxed">
            Gerencie integrações, sincronize pedidos e automatize operações de venda — tudo em um só lugar.
          </p>
        </div>

        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-primary-foreground/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                <Check className="w-3 h-3" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Sistema RAM. Todos os direitos reservados.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 lg:hidden">
              <Image src="/RAMHub.svg" alt="Hub RAM" width={160} height={46} className="h-12 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Entrar no Hub RAM</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie suas integrações de marketplace</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
