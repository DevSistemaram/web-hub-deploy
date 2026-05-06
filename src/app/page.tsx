import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <Image src="/RAMHub.svg" alt="Hub RAM" width={200} height={60} className="h-16 w-auto" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">Hub de Integração</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Conecte seu ERP ao{' '}
          <span className="font-semibold text-foreground">Mercado Livre</span> e{' '}
          <span className="font-semibold text-foreground">Shopee</span> em minutos.
          Receba todos os pedidos em um formato padronizado.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Criar conta grátis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
